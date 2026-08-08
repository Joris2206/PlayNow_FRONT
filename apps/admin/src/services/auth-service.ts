import { http } from "@/lib/http";
import { tokenStorage } from "@/lib/token-storage";

import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from "@/types/auth";

export const authService = {
  async login(
    credentials: LoginRequest
  ): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>(
      "/api/login/",
      credentials,
      {
        skipAuth: true,
        skipRefresh: true,
      }
    );

    tokenStorage.setTokens(
      response.access,
      response.refresh
    );

    return response;
  },

  async refresh(): Promise<RefreshResponse> {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No hay refresh token disponible.");
    }

    const response = await http.post<RefreshResponse>(
      "/api/token/refresh/",
      {
        refresh: refreshToken,
      },
      {
        skipAuth: true,
        skipRefresh: true,
      }
    );

    tokenStorage.setTokens(
      response.access,
      response.refresh
    );

    return response;
  },

  logout() {
    tokenStorage.clearTokens();
  },
};