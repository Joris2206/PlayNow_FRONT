import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type { PaginatedResponse } from "@/types/api";
import type {
  CommissionSettlement,
  CommissionSettlementFilters,
  CreateCommissionSettlementInput,
} from "@/types/commission";

export const commissionSettlementService = {
  list(
    params: CommissionSettlementFilters
  ): Promise<PaginatedResponse<CommissionSettlement>> {
    const pageSize =
      params.page_size === undefined
        ? undefined
        : Math.min(params.page_size, 200);
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      employee_public_id: params.employee_public_id,
      status: params.status,
      period_start: params.period_start,
      period_end: params.period_end,
      ordering: params.ordering,
      page: params.page,
      page_size: pageSize,
    });
    return http.get<PaginatedResponse<CommissionSettlement>>(
      `/api/commission-settlements/${query}`
    );
  },

  get(publicId: string): Promise<CommissionSettlement> {
    return http.get<CommissionSettlement>(
      `/api/commission-settlements/${publicId}/`
    );
  },

  create(
    data: CreateCommissionSettlementInput
  ): Promise<CommissionSettlement> {
    return http.post<CommissionSettlement>(
      "/api/commission-settlements/",
      data
    );
  },

  markPaid(publicId: string): Promise<CommissionSettlement> {
    return http.post<CommissionSettlement>(
      `/api/commission-settlements/${publicId}/mark-paid/`
    );
  },
};
