import { http } from "@/lib/http";
import {
  isTokenPair,
  prepareForLogin,
  startSession,
  terminateSession,
} from "@/lib/session";
import { tokenStorage } from "@/lib/token-storage";

import type {
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

export const authService = {
  async login(
    credentials: LoginRequest
  ): Promise<LoginResponse> {
    prepareForLogin();

    const response = await http.post<LoginResponse>(
      "/api/login/",
      credentials,
      {
        skipAuth: true,
        skipRefresh: true,
      }
    );

    if (!isTokenPair(response)) {
      await terminateSession();

      throw new Error(
        "La respuesta de inicio de sesión no contiene tokens válidos."
      );
    }

    startSession();
    tokenStorage.setTokens(
      response.access,
      response.refresh
    );

    return response;
  },

  logout() {
    return terminateSession();
  },
};
