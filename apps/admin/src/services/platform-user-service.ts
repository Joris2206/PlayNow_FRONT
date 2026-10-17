import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  PlatformUser,
  PlatformUserListParams,
  ResetPlatformUserPasswordRequest,
  UpdatePlatformUserRequest,
} from "@/types/platform-user";

export const platformUserService = {
  list(params: PlatformUserListParams) {
    const query = buildQueryString({
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      is_active: params.is_active,
      is_superuser: params.is_superuser,
    });

    return http.get<PaginatedResponse<PlatformUser>>(
      `/api/platform/users/${query}`
    );
  },

  get(publicId: string) {
    return http.get<PlatformUser>(`/api/platform/users/${publicId}/`);
  },

  update(publicId: string, data: UpdatePlatformUserRequest) {
    return http.patch<PlatformUser>(
      `/api/platform/users/${publicId}/`,
      data
    );
  },

  activate(publicId: string) {
    return http.post<PlatformUser>(
      `/api/platform/users/${publicId}/activate/`,
      {}
    );
  },

  deactivate(publicId: string) {
    return http.post<PlatformUser>(
      `/api/platform/users/${publicId}/deactivate/`,
      {}
    );
  },

  resetPassword(
    publicId: string,
    data: ResetPlatformUserPasswordRequest
  ) {
    return http.post<void>(
      `/api/platform/users/${publicId}/reset-password/`,
      data
    );
  },

  revokeSessions(publicId: string) {
    return http.post<void>(
      `/api/platform/users/${publicId}/revoke-sessions/`,
      {}
    );
  },
};
