import { getApiErrorMessage } from "@/lib/api-error";

import type { PaymentMethodType } from "@/types/payment-method";

export const PAYMENT_METHOD_TYPE_LABELS = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  other: "Otro",
} as const satisfies Record<PaymentMethodType, string>;

export const PAYMENT_METHOD_TYPE_OPTIONS = Object.entries(
  PAYMENT_METHOD_TYPE_LABELS
) as [PaymentMethodType, string][];

export function getPaymentMethodErrorMessage(
  error: unknown,
  fallback: string
) {
  return getApiErrorMessage(error, fallback);
}
