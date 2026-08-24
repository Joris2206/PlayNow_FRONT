import type { BusinessListQueryParams } from "@/types/api";

export type PaymentMethodType = "cash" | "card" | "transfer" | "other";

export type PaymentMethod = {
  public_id: string;
  business_public_id: string;
  name: string;
  method_type: PaymentMethodType;
  status_public_id: string;
  status_name: string;
};

export type CreatePaymentMethodRequest = {
  business_public_id: string;
  name: string;
  method_type: PaymentMethodType;
};

export type UpdatePaymentMethodRequest = {
  name?: string;
  method_type?: PaymentMethodType;
  status_public_id?: string;
};

export type PaymentMethodListParams = BusinessListQueryParams;
