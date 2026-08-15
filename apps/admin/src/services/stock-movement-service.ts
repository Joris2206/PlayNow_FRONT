import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  StockMovement,
  StockMovementListParams,
} from "@/types/stock-movement";

export const stockMovementService = {
  list(
    params: StockMovementListParams
  ): Promise<PaginatedResponse<StockMovement>> {
    const query = buildQueryString({
      business_public_id:
        params.business_public_id,
      product_public_id:
        params.product_public_id,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
    });

    return http.get<PaginatedResponse<StockMovement>>(
      `/api/stock-movements/${query}`
    );
  },
};
