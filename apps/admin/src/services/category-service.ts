import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type {
  PaginatedResponse,
  BusinessListQueryParams,
} from "@/types/api";

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

export const categoryService = {
  list(
    params: BusinessListQueryParams
  ): Promise<PaginatedResponse<Category>> {
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

    return http.get<PaginatedResponse<Category>>(
      `/api/categories/${query}`
    );
  },

  create(
    data: CreateCategoryRequest
  ): Promise<Category> {
    return http.post<Category>(
      "/api/categories/",
      data
    );
  },

  update(
    publicId: string,
    data: UpdateCategoryRequest
  ): Promise<Category> {
    return http.patch<Category>(
      `/api/categories/${publicId}/`,
      data
    );
  },

  delete(publicId: string): Promise<void> {
    return http.delete<void>(
      `/api/categories/${publicId}/`
    );
  },
};
