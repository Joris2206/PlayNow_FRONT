import { http } from "@/lib/http";

import type { PaginatedResponse } from "@/types/api";
import type { EntityStatus } from "@/types/entity-status";

export const statusService = {
  list(): Promise<PaginatedResponse<EntityStatus>> {
    return http.get<PaginatedResponse<EntityStatus>>(
      "/api/statuses/"
    );
  },
};
