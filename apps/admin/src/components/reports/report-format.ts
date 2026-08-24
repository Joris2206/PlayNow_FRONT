import { formatSaleMoney } from "@/components/sales/sales-format";
import { HttpError } from "@/lib/http";

export function formatReportMoney(value: string, currency: string) {
  return formatSaleMoney(value, currency);
}

export function formatReportDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" }).format(date);
}

export function hasNonZeroMoney(value: string) {
  return !/^[-+]?0*(?:\.0*)?$/.test(value.trim());
}

export function getFinancialReadErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof HttpError)) return fallback;
  if (error.status === 400) return "El período o alguno de los filtros no es válido.";
  if (error.status === 403) return "Tu rol no tiene permiso para consultar esta información.";
  if (error.status === 404) return "La información solicitada no está disponible.";
  return error.message;
}
