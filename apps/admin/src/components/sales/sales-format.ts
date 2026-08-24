export function formatSaleMoney(value: string, currency = "NIO") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;

  try {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: currency || "NIO",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatSaleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toMoneyMinorUnits(value: string) {
  const match = value.trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  return BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
}

export function subtractMoney(minuend: string, subtrahend: string) {
  const minuendMinor = toMoneyMinorUnits(minuend) ?? 0n;
  const subtrahendMinor = toMoneyMinorUnits(subtrahend) ?? 0n;
  const result = minuendMinor - subtrahendMinor;
  const safeResult = result > 0n ? result : 0n;
  return `${safeResult / 100n}.${String(safeResult % 100n).padStart(2, "0")}`;
}

export function calculateEstimatedTotal(
  lines: readonly { unitPrice: string; quantity: number }[]
) {
  const total = lines.reduce(
    (sum, line) => sum + (toMoneyMinorUnits(line.unitPrice) ?? 0n) * BigInt(Number.isInteger(line.quantity) ? line.quantity : 0),
    0n
  );
  return `${total / 100n}.${String(total % 100n).padStart(2, "0")}`;
}
