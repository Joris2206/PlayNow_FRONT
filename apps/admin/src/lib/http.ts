import { apiUrl } from "@/lib/api";
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

type RefreshResponse = {
  access: string;
  refresh: string;
};

let refreshPromise: Promise<boolean> | null = null;

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    skipRefresh = false,
    ...fetchOptions
  } = options;

  const response = await executeRequest(
    endpoint,
    fetchOptions,
    skipAuth
  );

  if (
    response.status === 401 &&
    !skipRefresh &&
    !skipAuth
  ) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const retryResponse = await executeRequest(
        endpoint,
        fetchOptions,
        false
      );

      return handleResponse<T>(retryResponse);
    }
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

  if (!skipAuth) {
    const accessToken = tokenStorage.getAccessToken();

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

  return fetch(url, {
    ...options,
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performRefresh();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function performRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    tokenStorage.clearTokens();

    return false;
  }

  try {
    const response = await fetch(
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

    if (!response.ok) {
      tokenStorage.clearTokens();

      return false;
    }

    const data =
      (await response.json()) as RefreshResponse;

    tokenStorage.setTokens(
      data.access,
      data.refresh
    );

    return true;
  } catch {
    tokenStorage.clearTokens();

    return false;
  }
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