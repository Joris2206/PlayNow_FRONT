import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  CreateCustomerRequest,
  Customer,
  CustomerListParams,
} from "@/types/customer";

export const customerService = {
  list(
    params: CustomerListParams
  ): Promise<PaginatedResponse<Customer>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.status_public_id,
    });

    return http.get<PaginatedResponse<Customer>>(
      `/api/customers/${query}`
    );
  },

  create(data: CreateCustomerRequest): Promise<Customer> {
    return http.post<Customer>("/api/customers/", data);
  },
};
