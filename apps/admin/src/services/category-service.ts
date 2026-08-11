import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type {
  PaginatedResponse,
  ListQueryParams,
} from "@/types/api";

import type {
  Category,
  CreateCategoryRequest,
} from "@/types/category";

export const categoryService = {
  list(
    params: ListQueryParams = {}
  ): Promise<PaginatedResponse<Category>> {
    const query = buildQueryString({
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
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
};