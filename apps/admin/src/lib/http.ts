import { apiUrl } from "@/lib/api";
import { extractDrfErrorMessage } from "@/lib/api-error";
import {
  getAuthSessionSnapshot,
  getSessionGeneration,
  isCurrentAuthRevision,
  isCurrentSession,
  isTokenPair,
  supportsAuthSessionLock,
  terminateSession,
  withAuthSessionLock,
} from "@/lib/session";
import { tokenStorage } from "@/lib/token-storage";

export class HttpError extends Error {
  status: number;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);

    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

type ExecutedRequest = {
  response: Response;
  accessToken: string | null;
};

type RefreshState = {
  generation: number;
  revision: string;
  promise: Promise<RefreshResolution>;
};

type RefreshResolution =
  | "refreshed"
  | "tokens-updated"
  | "session-changed"
  | "failed";

let refreshState: RefreshState | null = null;

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const sessionGeneration = getSessionGeneration();
  const sessionRevision =
    getAuthSessionSnapshot()?.revision ?? null;

  const {
    skipAuth = false,
    skipRefresh = false,
    ...fetchOptions
  } = options;

  const initialRequest = await executeRequest(
    endpoint,
    fetchOptions,
    skipAuth
  );

  if (
    initialRequest.response.status === 401 &&
    !skipRefresh &&
    !skipAuth
  ) {
    if (
      !sessionRevision ||
      !isCurrentSession(sessionGeneration) ||
      !isCurrentAuthRevision(sessionRevision)
    ) {
      return handleResponse<T>(initialRequest.response);
    }

    const currentAccessToken =
      tokenStorage.getAccessToken();

    if (
      currentAccessToken &&
      currentAccessToken !== initialRequest.accessToken
    ) {
      const retryWithCurrentToken =
        await executeRequest(
          endpoint,
          fetchOptions,
          false
        );

      return handleAuthenticatedRetry<T>(
        retryWithCurrentToken,
        sessionGeneration,
        sessionRevision
      );
    }

    const refreshToken = tokenStorage.getRefreshToken();
    const refreshResolution = await refreshAccessToken(
      sessionGeneration,
      sessionRevision,
      initialRequest.accessToken,
      refreshToken
    );

    if (
      (refreshResolution === "refreshed" ||
        refreshResolution === "tokens-updated") &&
      isCurrentSession(sessionGeneration) &&
      isCurrentAuthRevision(sessionRevision)
    ) {
      const retryResponse = await executeRequest(
        endpoint,
        fetchOptions,
        false
      );

      return handleAuthenticatedRetry<T>(
        retryResponse,
        sessionGeneration,
        sessionRevision
      );
    }
  }

  return handleResponse<T>(initialRequest.response);
}

async function handleAuthenticatedRetry<T>(
  request: ExecutedRequest,
  generation: number,
  revision: string
): Promise<T> {
  if (
    request.response.status === 401 &&
    isCurrentSession(generation) &&
    isCurrentAuthRevision(revision) &&
    tokenStorage.getAccessToken() === request.accessToken
  ) {
    await terminateSession({
      expectedRevision: revision,
    });
  }

  return handleResponse<T>(request.response);
}

async function executeRequest(
  endpoint: string,
  options: Omit<RequestOptions, "skipAuth" | "skipRefresh">,
  skipAuth: boolean
) {
  const url = `${apiUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  let accessToken: string | null = null;

  if (!skipAuth) {
    accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`
      );
    }
  }

  if (options.body !== undefined) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  return {
    response,
    accessToken,
  } satisfies ExecutedRequest;
}

async function refreshAccessToken(
  generation: number,
  revision: string,
  failedAccessToken: string | null,
  expectedRefreshToken: string | null
): Promise<RefreshResolution> {
  if (
    !isCurrentSession(generation) ||
    !isCurrentAuthRevision(revision)
  ) {
    return "session-changed";
  }

  if (!supportsAuthSessionLock()) {
    await terminateSession({
      expectedRevision: revision,
    });
    return "failed";
  }

  if (
    refreshState?.generation === generation &&
    refreshState.revision === revision
  ) {
    return refreshState.promise;
  }

  const promise = withAuthSessionLock(() =>
    performRefresh(
      generation,
      revision,
      failedAccessToken,
      expectedRefreshToken
    )
  );

  refreshState = {
    generation,
    revision,
    promise,
  };

  try {
    return await promise;
  } finally {
    if (refreshState?.promise === promise) {
      refreshState = null;
    }
  }
}

async function performRefresh(
  generation: number,
  revision: string,
  failedAccessToken: string | null,
  expectedRefreshToken: string | null
): Promise<RefreshResolution> {
  if (
    !isCurrentSession(generation) ||
    !isCurrentAuthRevision(revision)
  ) {
    return "session-changed";
  }

  const currentAccessToken = tokenStorage.getAccessToken();
  const currentRefreshToken = tokenStorage.getRefreshToken();

  if (
    currentAccessToken !== failedAccessToken ||
    currentRefreshToken !== expectedRefreshToken
  ) {
    return currentAccessToken && currentRefreshToken
      ? "tokens-updated"
      : "session-changed";
  }

  if (!currentRefreshToken) {
    if (
      isCurrentSession(generation) &&
      isCurrentAuthRevision(revision)
    ) {
      await terminateSession({
        expectedRevision: revision,
        lockAlreadyHeld: true,
      });
    }

    return "failed";
  }

  let response: Response;

  try {
    response = await fetch(
      `${apiUrl}/api/token/refresh/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          refresh: currentRefreshToken,
        }),
      }
    );
  } catch {
    throw new HttpError(
      "No fue posible renovar la sesión.",
      0
    );
  }

  if (
    !isCurrentSession(generation) ||
    !isCurrentAuthRevision(revision)
  ) {
    return "session-changed";
  }

  const latestAccessToken = tokenStorage.getAccessToken();
  const latestRefreshToken = tokenStorage.getRefreshToken();

  if (
    latestAccessToken !== currentAccessToken ||
    latestRefreshToken !== currentRefreshToken
  ) {
    return latestAccessToken && latestRefreshToken
      ? "tokens-updated"
      : "session-changed";
  }

  if (!response.ok) {
    if (
      response.status === 400 ||
      response.status === 401
    ) {
      await terminateSession({
        expectedRevision: revision,
        lockAlreadyHeld: true,
      });

      return "failed";
    }

    await handleResponse<never>(response);
    return "failed";
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    await terminateSession({
      expectedRevision: revision,
      lockAlreadyHeld: true,
    });

    return "failed";
  }

  if (
    !isCurrentSession(generation) ||
    !isCurrentAuthRevision(revision)
  ) {
    return "session-changed";
  }

  if (!isTokenPair(data)) {
    await terminateSession({
      expectedRevision: revision,
      lockAlreadyHeld: true,
    });

    return "failed";
  }

  if (
    tokenStorage.getAccessToken() !== currentAccessToken ||
    tokenStorage.getRefreshToken() !== currentRefreshToken
  ) {
    return tokenStorage.getAccessToken() &&
      tokenStorage.getRefreshToken()
      ? "tokens-updated"
      : "session-changed";
  }

  tokenStorage.setTokens(
    data.access,
    data.refresh
  );

  return isCurrentAuthRevision(revision)
    ? "refreshed"
    : "session-changed";
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const contentType =
    response.headers.get("content-type");

  let data: unknown = null;

  if (
    contentType?.includes("application/json")
  ) {
    data = await response.json();
  } else if (response.status !== 204) {
    data = await response.text();
  }

  if (!response.ok) {
    throw new HttpError(
      getErrorMessage(
        data,
        response.status
      ),
      response.status,
      data
    );
  }

  return data as T;
}

function getErrorMessage(
  data: unknown,
  status: number
): string {
  return extractDrfErrorMessage(data) ?? `Error HTTP ${status}`;
}

export const http = {
  get<T>(
    endpoint: string,
    options?: RequestOptions
  ) {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "GET",
      }
    );
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body,
      }
    );
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        body,
      }
    );
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body,
      }
    );
  },

  delete<T>(
    endpoint: string,
    options?: RequestOptions
  ) {
    return request<T>(
      endpoint,
      {
        ...options,
        method: "DELETE",
      }
    );
  },
};
