import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  Business,
  BusinessListParams,
} from "@/types/business";

export const businessService = {
  list(
    params: BusinessListParams
  ): Promise<PaginatedResponse<Business>> {
    const query = buildQueryString({
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.status_public_id,
    });

    return http.get<PaginatedResponse<Business>>(
      `/api/businesses/${query}`
    );
  },

  get(publicId: string): Promise<Business> {
    return http.get<Business>(`/api/businesses/${publicId}/`);
  },
};
