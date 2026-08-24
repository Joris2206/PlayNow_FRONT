import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  CashRegister,
  CashRegisterClosingPreview,
  CashRegisterListParams,
  CloseCashRegisterRequest,
  OpenCashRegisterRequest,
} from "@/types/cash";

export const cashRegisterService = {
  list(
    params: CashRegisterListParams
  ): Promise<PaginatedResponse<CashRegister>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      status: params.status,
      employee_public_id: params.employee_public_id,
      page: params.page,
      page_size: params.page_size,
      ordering: params.ordering,
    });

    return http.get<PaginatedResponse<CashRegister>>(
      `/api/cash-registers/${query}`
    );
  },

  get(publicId: string): Promise<CashRegister> {
    return http.get<CashRegister>(
      `/api/cash-registers/${publicId}/`
    );
  },

  open(data: OpenCashRegisterRequest): Promise<CashRegister> {
    return http.post<CashRegister>(
      "/api/cash-registers/",
      data
    );
  },

  closingPreview(
    publicId: string
  ): Promise<CashRegisterClosingPreview> {
    return http.get<CashRegisterClosingPreview>(
      `/api/cash-registers/${publicId}/closing-preview/`
    );
  },

  close(
    publicId: string,
    data: CloseCashRegisterRequest
  ): Promise<CashRegister> {
    return http.post<CashRegister>(
      `/api/cash-registers/${publicId}/close/`,
      data
    );
  },
};
