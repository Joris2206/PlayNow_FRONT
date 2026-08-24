import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  CashMovement,
  CashMovementListParams,
  CreateCashMovementRequest,
} from "@/types/cash";

export const cashMovementService = {
  list(
    params: CashMovementListParams
  ): Promise<PaginatedResponse<CashMovement>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      cash_register_public_id:
        params.cash_register_public_id,
      employee_public_id: params.employee_public_id,
      payment_method_public_id:
        params.payment_method_public_id,
      movement_type: params.movement_type,
      page: params.page,
      page_size: params.page_size,
      ordering: params.ordering,
    });

    return http.get<PaginatedResponse<CashMovement>>(
      `/api/cash-movements/${query}`
    );
  },

  get(publicId: string): Promise<CashMovement> {
    return http.get<CashMovement>(
      `/api/cash-movements/${publicId}/`
    );
  },

  create(
    data: CreateCashMovementRequest
  ): Promise<CashMovement> {
    return http.post<CashMovement>(
      "/api/cash-movements/",
      data
    );
  },
};
