import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type {
  DebtSummary,
  InventorySummary,
  InventorySummaryParams,
  MonthlySummary,
  MonthlySummaryParams,
  PaymentSummary,
  PaymentSummaryParams,
  ReportDateRangeParams,
} from "@/types/report";

export const reportService = {
  payments(params: PaymentSummaryParams) {
    return http.get<PaymentSummary>(
      `/api/reports/payments-summary/${buildQueryString(params)}`
    );
  },
  debts(params: ReportDateRangeParams) {
    return http.get<DebtSummary>(
      `/api/reports/debts-summary/${buildQueryString(params)}`
    );
  },
  monthly(params: MonthlySummaryParams) {
    return http.get<MonthlySummary>(
      `/api/reports/monthly-summary/${buildQueryString(params)}`
    );
  },
  inventory(params: InventorySummaryParams) {
    return http.get<InventorySummary>(
      `/api/reports/inventory-summary/${buildQueryString(params)}`
    );
  },
};
