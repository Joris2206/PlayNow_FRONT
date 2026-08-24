import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type { PaginatedResponse } from "@/types/api";
import type {
  CreatePaymentMethodRequest,
  PaymentMethod,
  PaymentMethodListParams,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method";

export const paymentMethodService = {
  list(params: PaymentMethodListParams): Promise<PaginatedResponse<PaymentMethod>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.status_public_id,
    });
    return http.get<PaginatedResponse<PaymentMethod>>(`/api/payment-methods/${query}`);
  },

  get(publicId: string): Promise<PaymentMethod> {
    return http.get<PaymentMethod>(`/api/payment-methods/${publicId}/`);
  },

  create(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    return http.post<PaymentMethod>("/api/payment-methods/", data);
  },

  update(publicId: string, data: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    return http.patch<PaymentMethod>(`/api/payment-methods/${publicId}/`, data);
  },

  replace(publicId: string, data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    return http.put<PaymentMethod>(`/api/payment-methods/${publicId}/`, data);
  },

  delete(publicId: string): Promise<void> {
    return http.delete<void>(`/api/payment-methods/${publicId}/`);
  },
};
