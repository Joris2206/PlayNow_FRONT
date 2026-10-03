import { formatSaleMoney } from "@/components/sales/sales-format";
import { extractDrfErrorMessage, getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";

import type { CashMovementType } from "@/types/cash";

export const CASH_MOVEMENT_TYPE_LABELS = {
  deposit: "Depósito",
  withdrawal: "Retiro",
  employee_advance: "Adelanto a empleado",
  employee_repayment: "Reintegro de empleado",
  other_income: "Otro ingreso",
  other_expense: "Otro gasto",
} as const satisfies Record<CashMovementType, string>;

export const CASH_MOVEMENT_TYPE_OPTIONS = Object.entries(
  CASH_MOVEMENT_TYPE_LABELS
) as [CashMovementType, string][];

export const EMPLOYEE_REQUIRED_MOVEMENT_TYPES = new Set<
  CashMovementType
>(["employee_advance", "employee_repayment"]);

export const CASH_MONEY_INPUT_PATTERN =
  /^\d*(?:\.\d{0,2})?$/;

const API_FIELD_LABELS: Record<string, string> = {
  business_public_id: "Negocio",
  employee_public_id: "Employee",
  payment_method_public_id: "Método de pago",
  cash_register_public_id: "Caja",
  movement_type: "Tipo de movimiento",
  opening_balance: "Saldo inicial",
  closing_balance: "Saldo contado",
  opening_notes: "Notas de apertura",
  closing_notes: "Notas de cierre",
  amount: "Importe",
  note: "Nota",
  status: "Estado",
  non_field_errors: "Validación",
};

export function getCashErrorMessage(
  error: unknown,
  fallback: string
) {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (typeof error.data === "object" && error.data !== null) {
    const data = error.data as Record<string, unknown>;
    const detailMessage = extractDrfErrorMessage(data.detail);

    if (detailMessage) {
      return detailMessage;
    }

    for (const [field, value] of Object.entries(data)) {
      const message = extractDrfErrorMessage(value);

      if (message) {
        return `${API_FIELD_LABELS[field] ?? field}: ${message}`;
      }
    }
  }

  if (error.status === 403) {
    return "No tienes permisos para operar la caja de este negocio.";
  }

  if (error.status === 404) {
    return "La caja o uno de los recursos seleccionados ya no está disponible.";
  }

  if (error.status === 405) {
    return "Esta operación no está disponible para caja.";
  }

  return getApiErrorMessage(error, fallback);
}

export function formatCashDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCashMoney(
  value: string | null,
  currency: string
) {
  return value === null
    ? "—"
    : formatSaleMoney(value, currency);
}

export function formatSignedCashMoney(
  signedAmount: string,
  currency: string
) {
  const formatted = formatSaleMoney(
    signedAmount,
    currency
  );

  return signedAmount.trim().startsWith("-")
    ? formatted
    : `+ ${formatted}`;
}
