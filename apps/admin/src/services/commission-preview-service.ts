import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type {
  CommissionPreview,
  CommissionPreviewParams,
} from "@/types/commission";

export const commissionPreviewService = {
  get(params: CommissionPreviewParams): Promise<CommissionPreview> {
    return http.get<CommissionPreview>(
      `/api/reports/employee-commission/${buildQueryString(params)}`
    );
  },
};
