import { http } from "@/lib/http";
import {
  establishAuthenticatedSession,
  isTokenPair,
  terminateSession,
} from "@/lib/session";

import type {
  LoginRequest,
  LoginResponse,
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

    if (!isTokenPair(response)) {
      throw new Error(
        "La respuesta de inicio de sesión no contiene tokens válidos."
      );
    }

    const established = await establishAuthenticatedSession(
      response.access,
      response.refresh
    );

    if (!established) {
      throw new Error(
        "La sesión cambió mientras se completaba el inicio de sesión."
      );
    }

    return response;
  },

  logout() {
    return terminateSession();
  },
};
