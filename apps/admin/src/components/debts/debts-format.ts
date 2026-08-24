import type { PaymentStatus } from "@/types/transaction";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Pagado",
  partial: "Parcial",
  pending: "Pendiente",
};

export function getPaymentStatusClassName(status: PaymentStatus) {
  return status === "paid"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
    : "border-amber-500/20 bg-amber-500/10 text-amber-400";
}

export function formatDebtAmount(value: string) {
  const match = value.trim().match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) return value;
  const integer = match[2].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimals = (match[3] ?? "").padEnd(2, "0").slice(0, 2);
  return `${match[1]}${integer}.${decimals}`;
}

export function formatDebtDate(value: string) {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" }).format(date);
}
