import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type {
  PaginatedResponse,
} from "@/types/api";

import type {
  CreateProductRequest,
  Product,
  ProductListParams,
  UpdateProductRequest,
} from "@/types/product";

export const productService = {
  list(
    params: ProductListParams
  ): Promise<PaginatedResponse<Product>> {
    const query = buildQueryString({
      business_public_id:
        params.business_public_id,

      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status_public_id:
        params.status_public_id,
    });

    return http.get<PaginatedResponse<Product>>(
      `/api/products/${query}`
    );
  },

  create(
    data: CreateProductRequest
  ): Promise<Product> {
    return http.post<Product>(
      "/api/products/",
      data
    );
  },

  update(
    publicId: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    return http.patch<Product>(
      `/api/products/${publicId}/`,
      data
    );
  },

  delete(publicId: string): Promise<void> {
    return http.delete<void>(
      `/api/products/${publicId}/`
    );
  },
};
