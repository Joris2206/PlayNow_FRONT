import { HttpError } from "@/lib/http";

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

function firstErrorMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const message = firstErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

export function getPaymentMethodErrorMessage(
  error: unknown,
  fallback: string
) {
  if (error instanceof HttpError) {
    return firstErrorMessage(error.data) ?? error.message;
  }

  return error instanceof Error ? error.message : fallback;
}
