import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type { PaginatedResponse } from "@/types/api";
import type {
  CommissionPlan,
  CommissionPlanFilters,
  CreateCommissionPlanInput,
  PatchCommissionPlanInput,
  ReplaceCommissionPlanInput,
} from "@/types/commission";

export const commissionPlanService = {
  list(
    params: CommissionPlanFilters
  ): Promise<PaginatedResponse<CommissionPlan>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      employee_public_id: params.employee_public_id,
      is_active: params.is_active,
      ordering: params.ordering,
      page: params.page,
      page_size: params.page_size,
    });
    return http.get<PaginatedResponse<CommissionPlan>>(
      `/api/commission-plans/${query}`
    );
  },

  get(publicId: string): Promise<CommissionPlan> {
    return http.get<CommissionPlan>(
      `/api/commission-plans/${publicId}/`
    );
  },

  create(data: CreateCommissionPlanInput): Promise<CommissionPlan> {
    return http.post<CommissionPlan>("/api/commission-plans/", data);
  },

  replace(
    publicId: string,
    data: ReplaceCommissionPlanInput
  ): Promise<CommissionPlan> {
    return http.put<CommissionPlan>(
      `/api/commission-plans/${publicId}/`,
      data
    );
  },

  patch(
    publicId: string,
    data: PatchCommissionPlanInput
  ): Promise<CommissionPlan> {
    return http.patch<CommissionPlan>(
      `/api/commission-plans/${publicId}/`,
      data
    );
  },

  delete(publicId: string): Promise<void> {
    return http.delete<void>(`/api/commission-plans/${publicId}/`);
  },
};
