"use client";

import { Eye, HandCoins, Landmark } from "lucide-react";
import { getCatalogStatusClassName } from "@/lib/catalog-status";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDebtAmount, formatDebtDate, getPaymentStatusClassName, PAYMENT_STATUS_LABELS } from "@/components/debts/debts-format";
import { canRegisterDebtPayment, getDebtPaymentCopy } from "@/components/debts/debt-payment-eligibility";
import type { Debt } from "@/types/debt";

type Props = {
  debts: Debt[];
  transactionType: "sale" | "purchase";
  canPay: boolean;
  onView: (debt: Debt) => void;
  onPay: (debt: Debt) => void;
};

function counterpartName(debt: Debt) {
  if (debt.direction === "receivable") return debt.customer_name ?? "Sin cliente";
  if (debt.direction === "payable") return debt.supplier_name ?? "Sin proveedor";
  return debt.customer_name ?? debt.supplier_name ?? "Sin contraparte";
}

export default function DebtsTable({ debts, transactionType, canPay, onView, onPay }: Props) {
  const partyLabel = transactionType === "sale" ? "Cliente" : "Proveedor";
  if (debts.length === 0) return <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center"><Landmark className="h-7 w-7 text-zinc-600" /><h3 className="mt-3 font-medium text-white">No hay cuentas en esta vista</h3><p className="mt-2 text-sm text-zinc-500">No encontramos deudas que coincidan con los filtros seleccionados.</p></div>;

  return <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"><Table stickyHeader className="min-w-[1180px]"><TableHeader className="bg-white/[0.02]"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-5 text-zinc-500">Fecha</TableHead><TableHead className="px-5 text-zinc-500">{partyLabel}</TableHead><TableHead className="px-5 text-right text-zinc-500">Total</TableHead><TableHead className="px-5 text-right text-zinc-500">Pagado</TableHead><TableHead className="px-5 text-right text-zinc-500">Saldo pendiente</TableHead><TableHead className="px-5 text-zinc-500">Estado de deuda</TableHead><TableHead className="px-5 text-zinc-500">Operación</TableHead><TableHead className="w-72 px-5" /></TableRow></TableHeader><TableBody>{debts.map((debt) => { const paymentCopy = getDebtPaymentCopy(debt); const mayPay = canPay && canRegisterDebtPayment(debt); return <TableRow key={debt.public_id} className="border-white/10 hover:bg-white/[0.025]"><TableCell className="px-5 text-zinc-300">{formatDebtDate(debt.created_at)}</TableCell><TableCell className="px-5 font-medium text-white">{counterpartName(debt)}</TableCell><TableCell className="px-5 text-right text-zinc-300">{formatDebtAmount(debt.total_amount)}</TableCell><TableCell className="px-5 text-right text-zinc-300">{formatDebtAmount(debt.paid_amount)}</TableCell><TableCell className="px-5 text-right font-semibold text-white">{formatDebtAmount(debt.outstanding_amount)}</TableCell><TableCell className="px-5"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", debt.is_settled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400")}>{debt.is_settled ? "Liquidada" : "Pendiente"}</span></TableCell><TableCell className="px-5"><div className="space-y-2"><div className="flex items-center gap-2"><span className="w-12 text-xs text-zinc-500">Pago</span><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getPaymentStatusClassName(debt.payment_status))}>{PAYMENT_STATUS_LABELS[debt.payment_status]}</span></div><div className="flex items-center gap-2"><span className="w-12 text-xs text-zinc-500">Estado</span><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getCatalogStatusClassName(debt.transaction_status_name))}>{debt.transaction_status_name}</span></div></div></TableCell><TableCell className="px-5"><div className="flex justify-end gap-1"><Button type="button" variant="ghost" size="sm" onClick={() => onView(debt)} className="text-zinc-300 hover:bg-white/5 hover:text-white"><Eye className="h-4 w-4" />Ver detalle</Button>{mayPay && <Button type="button" variant="ghost" size="sm" onClick={() => onPay(debt)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300"><HandCoins className="h-4 w-4" />{paymentCopy.action}</Button>}</div></TableCell></TableRow>; })}</TableBody></Table></div>;
}
