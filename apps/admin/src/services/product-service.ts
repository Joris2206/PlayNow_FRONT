import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type {
  PaginatedResponse,
} from "@/types/api";

import type {
  Product,
  ProductListParams,
} from "@/types/product";

export const productService = {
  list(
    params: ProductListParams
  ): Promise<PaginatedResponse<Product>> {
    const query = buildQueryString({
      business__public_id:
        params.business_public_id,

      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status: params.status,
    });

    return http.get<PaginatedResponse<Product>>(
      `/api/products/${query}`
    );
  },
};