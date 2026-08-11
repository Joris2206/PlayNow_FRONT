import { http } from "@/lib/http";

import type { AuthUser } from "@/types/user";

export const userService = {
  me(): Promise<AuthUser> {
    return http.get<AuthUser>("/api/me/");
  },
};