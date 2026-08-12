import { apiUrl } from "@/lib/api";
import {
  getSessionGeneration,
  isCurrentSession,
  isTokenPair,
  terminateSession,
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
  promise: Promise<boolean>;
};

let refreshState: RefreshState | null = null;

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const sessionGeneration = getSessionGeneration();

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
    if (!isCurrentSession(sessionGeneration)) {
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
        retryWithCurrentToken.response,
        sessionGeneration
      );
    }

    const refreshed = await refreshAccessToken(
      sessionGeneration
    );

    if (
      refreshed &&
      isCurrentSession(sessionGeneration)
    ) {
      const retryResponse = await executeRequest(
        endpoint,
        fetchOptions,
        false
      );

      return handleAuthenticatedRetry<T>(
        retryResponse.response,
        sessionGeneration
      );
    }
  }

  return handleResponse<T>(initialRequest.response);
}

async function handleAuthenticatedRetry<T>(
  response: Response,
  generation: number
): Promise<T> {
  if (
    response.status === 401 &&
    isCurrentSession(generation)
  ) {
    await terminateSession();
  }

  return handleResponse<T>(response);
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
  generation: number
): Promise<boolean> {
  if (!isCurrentSession(generation)) {
    return false;
  }

  if (refreshState?.generation === generation) {
    return refreshState.promise;
  }

  const promise = performRefresh(generation);

  refreshState = {
    generation,
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
  generation: number
): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    if (isCurrentSession(generation)) {
      await terminateSession();
    }

    return false;
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
          refresh: refreshToken,
        }),
      }
    );
  } catch {
    throw new HttpError(
      "No fue posible renovar la sesión.",
      0
    );
  }

  if (!response.ok) {
    if (
      response.status === 400 ||
      response.status === 401
    ) {
      if (isCurrentSession(generation)) {
        await terminateSession();
      }

      return false;
    }

    return handleResponse<boolean>(response);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    if (isCurrentSession(generation)) {
      await terminateSession();
    }

    return false;
  }

  if (!isCurrentSession(generation)) {
    return false;
  }

  if (!isTokenPair(data)) {
    await terminateSession();

    return false;
  }

  tokenStorage.setTokens(
    data.access,
    data.refresh
  );

  return true;
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
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    typeof data === "string" &&
    data.length > 0
  ) {
    return data;
  }

  return `Error HTTP ${status}`;
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
