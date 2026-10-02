"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { useDebtPayments } from "@/hooks/use-debt-payments";
import { getCatalogStatusClassName } from "@/lib/catalog-status";
import { HttpError } from "@/lib/http";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ListPagination from "@/components/shared/list-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDebtAmount, formatDebtDate, getPaymentStatusClassName, PAYMENT_STATUS_LABELS } from "@/components/debts/debts-format";
import type { Debt } from "@/types/debt";

const PAYMENT_PAGE_SIZE = 10;

type Props = {
  debt: Debt | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function debtTypeLabel(debt: Debt) {
  if (debt.direction === "receivable") return "Cuenta por cobrar";
  if (debt.direction === "payable") return "Cuenta por pagar";
  return "Deuda sin clasificación";
}

function counterpart(debt: Debt) {
  if (debt.direction === "receivable") return { label: "Cliente", name: debt.customer_name ?? "Sin cliente" };
  if (debt.direction === "payable") return { label: "Proveedor", name: debt.supplier_name ?? "Sin proveedor" };
  return { label: "Contraparte", name: debt.customer_name ?? debt.supplier_name ?? "Sin contraparte" };
}

function historyErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) return "No fue posible cargar el historial de pagos.";
  if (error.status === 400) return "El negocio o el filtro de la deuda no es válido.";
  if (error.status === 403) return "No tienes permisos para consultar estos pagos.";
  if (error.status === 404) return "El historial de esta deuda no está disponible.";
  return error.message;
}

export default function DebtDetailDialog({ debt, businessPublicId, open, onOpenChange }: Props) {
  const [paymentPage, setPaymentPage] = useState(1);
  useEffect(() => setPaymentPage(1), [debt?.public_id, open]);
  const paymentsQuery = useDebtPayments({ businessPublicId: open ? businessPublicId : undefined, debtPublicId: open ? debt?.public_id : undefined, page: paymentPage, pageSize: PAYMENT_PAGE_SIZE });
  if (!debt) return null;
  const party = counterpart(debt);
  const payments = paymentsQuery.data;

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-5xl"><DialogHeader><DialogTitle>{debtTypeLabel(debt)}</DialogTitle><DialogDescription className="text-zinc-500">Detalle financiero e historial de pagos registrados.</DialogDescription></DialogHeader>
    <dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div><dt className="text-xs text-zinc-500">{party.label}</dt><dd className="mt-1 text-sm font-medium text-white">{party.name}</dd></div>
      <div><dt className="text-xs text-zinc-500">Fecha</dt><dd className="mt-1 text-sm text-white">{formatDebtDate(debt.created_at)}</dd></div>
      <div><dt className="text-xs text-zinc-500">Fecha de vencimiento</dt><dd className="mt-1 text-sm text-white">{formatDebtDate(debt.due_date)}</dd></div>
      <div><dt className="text-xs text-zinc-500">Estado de deuda</dt><dd className="mt-1"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", debt.is_settled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400")}>{debt.is_settled ? "Liquidada" : "Pendiente"}</span></dd></div>
      <div><dt className="text-xs text-zinc-500">Total</dt><dd className="mt-1 text-sm text-white">{formatDebtAmount(debt.total_amount)}</dd></div>
      <div><dt className="text-xs text-zinc-500">Pagado</dt><dd className="mt-1 text-sm text-white">{formatDebtAmount(debt.paid_amount)}</dd></div>
      <div><dt className="text-xs text-zinc-500">Saldo pendiente</dt><dd className="mt-1 text-sm font-semibold text-white">{formatDebtAmount(debt.outstanding_amount)}</dd></div>
      <div><dt className="text-xs text-zinc-500">Estado de pago</dt><dd className="mt-1"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getPaymentStatusClassName(debt.payment_status))}>{PAYMENT_STATUS_LABELS[debt.payment_status]}</span></dd></div>
      <div><dt className="text-xs text-zinc-500">Estado de la operación</dt><dd className="mt-1"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getCatalogStatusClassName(debt.transaction_status_name))}>{debt.transaction_status_name}</span></dd></div>
    </dl>

    <section className="space-y-4"><div><h3 className="font-medium text-white">Historial de pagos</h3><p className="mt-1 text-sm text-zinc-500">Pagos registrados para esta deuda, en modo de solo lectura.</p></div>
      {paymentsQuery.isLoading && <div className="flex min-h-36 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]"><LoaderCircle className="h-6 w-6 animate-spin text-red-500" /></div>}
      {paymentsQuery.isError && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"><div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /><span>{historyErrorMessage(paymentsQuery.error)}</span></div><Button type="button" variant="ghost" size="sm" onClick={() => paymentsQuery.refetch()} className="mt-2 text-red-300">Reintentar</Button></div>}
      {paymentsQuery.isSuccess && payments && <>{payments.results.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">Esta deuda no tiene pagos registrados.</div> : <div className="overflow-hidden rounded-xl border border-white/10"><Table className="min-w-[680px]"><TableHeader className="bg-white/[0.02]"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-4 text-zinc-500">Fecha de pago</TableHead><TableHead className="px-4 text-right text-zinc-500">Importe</TableHead><TableHead className="px-4 text-zinc-500">Método</TableHead><TableHead className="px-4 text-zinc-500">Registrado por</TableHead></TableRow></TableHeader><TableBody>{payments.results.map((payment) => <TableRow key={payment.public_id} className="border-white/10"><TableCell className="px-4 text-zinc-300">{formatDebtDate(payment.payment_date)}</TableCell><TableCell className="px-4 text-right font-medium text-white">{formatDebtAmount(payment.amount)}</TableCell><TableCell className="px-4 text-zinc-300">{payment.payment_method_name}</TableCell><TableCell className="px-4 text-zinc-300">{payment.created_by_name ?? "Registro histórico"}</TableCell></TableRow>)}</TableBody></Table></div>}{payments.total_pages > 1 && <ListPagination count={payments.count} singularLabel="pago" pluralLabel="pagos" currentPage={payments.current_page} totalPages={payments.total_pages} hasPrevious={Boolean(payments.previous)} hasNext={Boolean(payments.next)} onPageChange={setPaymentPage} />}</>}
    </section>
  </DialogContent></Dialog>;
}
