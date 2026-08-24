import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type { PaginatedResponse } from "@/types/api";
import type { CreateDebtPaymentRequest, Debt, DebtListParams, DebtPayment, DebtPaymentListParams } from "@/types/debt";

export const debtService = {
  list(params: DebtListParams): Promise<PaginatedResponse<Debt>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      transaction_type: params.transaction_type,
      is_settled: params.is_settled,
      customer_public_id: params.customer_public_id,
      supplier_public_id: params.supplier_public_id,
      transaction_public_id: params.transaction_public_id,
      page: params.page,
      page_size: params.page_size,
      ordering: params.ordering,
    });
    return http.get<PaginatedResponse<Debt>>(`/api/debts/${query}`);
  },

  get(publicId: string): Promise<Debt> {
    return http.get<Debt>(`/api/debts/${publicId}/`);
  },

  listPayments(params: DebtPaymentListParams): Promise<PaginatedResponse<DebtPayment>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      debt_public_id: params.debt_public_id,
      page: params.page,
      page_size: params.page_size,
      ordering: params.ordering,
    });
    return http.get<PaginatedResponse<DebtPayment>>(`/api/debt-payments/${query}`);
  },

  createPayment(data: CreateDebtPaymentRequest): Promise<DebtPayment> {
    return http.post<DebtPayment>("/api/debt-payments/", data);
  },
};
