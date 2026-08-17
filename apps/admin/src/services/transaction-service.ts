import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type { CreateSaleRequest, Transaction, TransactionListParams } from "@/types/transaction";

export const transactionService = {
  list(params: TransactionListParams): Promise<PaginatedResponse<Transaction>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      type: params.type,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.status_public_id,
      date_from: params.date_from,
      date_to: params.date_to,
    });

    return http.get<PaginatedResponse<Transaction>>(`/api/transactions/${query}`);
  },

  createSale(data: CreateSaleRequest): Promise<Transaction> {
    return http.post<Transaction>("/api/transactions/", data);
  },

  cancel(publicId: string): Promise<void> {
    return http.delete<void>(`/api/transactions/${publicId}/`);
  },
};
