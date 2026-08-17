import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type { PaginatedResponse } from "@/types/api";
import type { CreateSupplierRequest, Supplier, SupplierListParams } from "@/types/supplier";

export const supplierService = {
  list(params: SupplierListParams): Promise<PaginatedResponse<Supplier>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.status_public_id,
    });
    return http.get<PaginatedResponse<Supplier>>(`/api/suppliers/${query}`);
  },

  create(data: CreateSupplierRequest): Promise<Supplier> {
    return http.post<Supplier>("/api/suppliers/", data);
  },
};
