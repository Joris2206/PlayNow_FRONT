import { isTerminalCatalogStatus } from "@/lib/catalog-status";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";
import type { Debt } from "@/types/debt";

export function canRegisterDebtPayment(debt: Debt) {
  const outstandingMinor = toMoneyMinorUnits(debt.outstanding_amount);
  return (debt.direction === "receivable" || debt.direction === "payable") &&
    !debt.is_settled &&
    outstandingMinor !== null &&
    outstandingMinor > 0n &&
    !isTerminalCatalogStatus(debt.transaction_status_name);
}

export function getDebtPaymentCopy(debt: Debt) {
  return debt.direction === "receivable"
    ? { action: "Registrar cobro", amount: "Importe recibido" }
    : { action: "Registrar pago", amount: "Importe pagado" };
}
