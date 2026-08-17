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

function toMinorUnits(value: string) {
  const match = value.trim().match(/^(\d+)(?:\.(\d{1,2}))?/);
  if (!match) return 0n;
  return BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
}

export function calculateEstimatedTotal(
  lines: readonly { unitPrice: string; quantity: number }[]
) {
  const total = lines.reduce(
    (sum, line) => sum + toMinorUnits(line.unitPrice) * BigInt(Number.isInteger(line.quantity) ? line.quantity : 0),
    0n
  );
  return `${total / 100n}.${String(total % 100n).padStart(2, "0")}`;
}
