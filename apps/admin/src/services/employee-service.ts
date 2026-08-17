import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type { EmployeeListParams, EmployeeOption } from "@/types/employee";

export const employeeService = {
  list(params: EmployeeListParams): Promise<PaginatedResponse<EmployeeOption>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
    });

    return http.get<PaginatedResponse<EmployeeOption>>(`/api/employees/${query}`);
  },
};
