import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeListParams,
  EmployeeOption,
  UpdateEmployeeRequest,
} from "@/types/employee";

function employeeListQuery(params: EmployeeListParams) {
  return buildQueryString({
    business_public_id: params.business_public_id,
    page: params.page,
    page_size: params.page_size,
    search: params.search,
    ordering: params.ordering,
    status_public_id: params.status_public_id,
  });
}

export const employeeService = {
  list(params: EmployeeListParams): Promise<PaginatedResponse<EmployeeOption>> {
    return http.get<PaginatedResponse<EmployeeOption>>(
      `/api/employees/${employeeListQuery(params)}`
    );
  },

  listAdmin(params: EmployeeListParams): Promise<PaginatedResponse<Employee>> {
    return http.get<PaginatedResponse<Employee>>(
      `/api/employees/${employeeListQuery(params)}`
    );
  },

  get(publicId: string): Promise<Employee> {
    return http.get<Employee>(`/api/employees/${publicId}/`);
  },

  create(data: CreateEmployeeRequest): Promise<Employee> {
    return http.post<Employee>("/api/employees/", data);
  },

  update(publicId: string, data: UpdateEmployeeRequest): Promise<Employee> {
    return http.patch<Employee>(`/api/employees/${publicId}/`, data);
  },

  delete(publicId: string): Promise<void> {
    return http.delete<void>(`/api/employees/${publicId}/`);
  },
};
