import { formatReportDate, formatReportMoney } from "@/components/reports/report-format";
import { HttpError } from "@/lib/http";
import type { CommissionSettlementStatus } from "@/types/commission";

export const COMMISSION_PERCENTAGE_PATTERN = /^\d*(?:\.\d*)?$/;

export function isValidCommissionPercentage(value: string) {
  if (!/^\d+(?:\.\d+)?$/.test(value)) return false;
  const [integerPart, fractionPart = ""] = value.split(".");
  const integer = BigInt(integerPart);
  if (integer < 100n) return true;
  return integer === 100n && !/[1-9]/.test(fractionPart);
}

function messagesFrom(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) return [value];
  if (Array.isArray(value)) return value.flatMap(messagesFrom);
  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(messagesFrom);
  }
  return [];
}

export function getCommissionFieldError(
  error: unknown,
  field: string
) {
  if (
    !(error instanceof HttpError) ||
    typeof error.data !== "object" ||
    error.data === null ||
    !(field in error.data)
  ) {
    return null;
  }
  const messages = messagesFrom(
    (error.data as Record<string, unknown>)[field]
  );
  return messages.length > 0 ? messages.join(" ") : null;
}

export function getCommissionErrorMessage(
  error: unknown,
  fallback: string
) {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error.message : fallback;
  }
  if (typeof error.data === "object" && error.data !== null) {
    const data = error.data as Record<string, unknown>;
    for (const field of [
      "detail",
      "non_field_errors",
      "commission_plan",
      "period",
      "status",
    ]) {
      const messages = messagesFrom(data[field]);
      if (messages.length > 0) return messages.join(" ");
    }
    const messages = messagesFrom(data);
    if (messages.length > 0) return messages.join(" ");
  }
  if (error.status === 403) {
    return "No tienes permisos para realizar esta operación con comisiones.";
  }
  if (error.status === 404) {
    return "El recurso solicitado ya no está disponible en este negocio.";
  }
  if (error.status === 405) {
    return "Esta operación no está permitida para la liquidación.";
  }
  return error.message || fallback;
}

export const formatCommissionMoney = formatReportMoney;
export const formatCommissionDate = formatReportDate;

export function formatCommissionDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const COMMISSION_SETTLEMENT_STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Pagada",
  cancelled: "Cancelada",
} as const satisfies Record<CommissionSettlementStatus, string>;

export function commissionSettlementStatusClassName(
  status: CommissionSettlementStatus
) {
  if (status === "paid") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }
  if (status === "pending") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
  return "border-red-500/20 bg-red-500/10 text-red-400";
}
