"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useCreateDebtPayment, useRefreshDebtPaymentEffects } from "@/hooks/use-debt-payments";
import { useDebt } from "@/hooks/use-debts";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { HttpError } from "@/lib/http";
import DateInput from "@/components/shared/date-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { canRegisterDebtPayment, getDebtPaymentCopy } from "@/components/debts/debt-payment-eligibility";
import { formatDebtAmount } from "@/components/debts/debts-format";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";
import type { Debt } from "@/types/debt";

const PAYMENT_METHOD_PAGE_SIZE = 100;
const PAYMENT_METHOD_TYPE_LABELS = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", other: "Otro" } as const;
const API_FIELD_LABELS: Record<string, string> = {
  amount: "Importe",
  payment_date: "Fecha de pago",
  payment_method_public_id: "Método de pago",
  debt_public_id: "Deuda",
  non_field_errors: "Validación",
};

type Props = {
  debt: Debt | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function localToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function firstString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstString(item);
      if (message) return message;
    }
  }
  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const message = firstString(item);
      if (message) return message;
    }
  }
  return null;
}

function paymentErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) return error instanceof Error ? error.message : "No fue posible registrar el pago.";
  if (typeof error.data === "object" && error.data !== null) {
    const data = error.data as Record<string, unknown>;
    const detailMessage = firstString(data.detail ?? data.details);
    if (detailMessage) return detailMessage;
    for (const [field, value] of Object.entries(error.data)) {
      const message = firstString(value);
      if (message) return `${API_FIELD_LABELS[field] ?? field}: ${message}`;
    }
  }
  if (error.status === 403) return "No tienes permisos para registrar este pago.";
  if (error.status === 404) return "La deuda o el método de pago ya no está disponible para este negocio.";
  if (error.status === 409) return "El saldo cambió por otro pago. Revisa el saldo actualizado antes de continuar.";
  return error.message;
}

function counterpartName(debt: Debt) {
  if (debt.direction === "receivable") return debt.customer_name ?? "Sin cliente";
  if (debt.direction === "payable") return debt.supplier_name ?? "Sin proveedor";
  return debt.customer_name ?? debt.supplier_name ?? "Sin contraparte";
}

export default function RegisterDebtPaymentDialog({ debt, businessPublicId, open, onOpenChange }: Props) {
  const today = localToday();
  const [amount, setAmount] = useState("");
  const [paymentMethodPublicId, setPaymentMethodPublicId] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const createPayment = useCreateDebtPayment();
  const refreshPaymentEffects = useRefreshDebtPaymentEffects();
  const resetCreatePayment = createPayment.reset;
  const debtQuery = useDebt(open ? businessPublicId : undefined, open ? debt?.public_id : undefined);
  const paymentMethodsQuery = usePaymentMethods({ businessPublicId: open ? businessPublicId : undefined, page: 1, pageSize: PAYMENT_METHOD_PAGE_SIZE, ordering: "name" });

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setPaymentMethodPublicId("");
    setPaymentDate(localToday());
    setAttemptedSubmit(false);
    resetCreatePayment();
  }, [open, businessPublicId, debt?.public_id, resetCreatePayment]);

  useEffect(() => {
    if (!paymentMethodPublicId || !paymentMethodsQuery.isSuccess) return;
    if (!paymentMethodsQuery.data.results.some((method) => method.public_id === paymentMethodPublicId)) {
      setPaymentMethodPublicId("");
    }
  }, [paymentMethodPublicId, paymentMethodsQuery.data, paymentMethodsQuery.isSuccess]);

  if (!debt) return null;
  const currentDebt = debtQuery.data ?? debt;
  const copy = getDebtPaymentCopy(currentDebt);
  const amountMinor = toMoneyMinorUnits(amount);
  const outstandingMinor = toMoneyMinorUnits(currentDebt.outstanding_amount) ?? 0n;
  const validAmount = amountMinor !== null && amountMinor > 0n && amountMinor <= outstandingMinor;
  const validDate = Boolean(paymentDate) && paymentDate <= today;
  const debtEligible = canRegisterDebtPayment(currentDebt);
  const canSubmit = Boolean(
    businessPublicId &&
    debtQuery.isSuccess &&
    debtEligible &&
    validAmount &&
    paymentMethodPublicId &&
    validDate
  );

  function resetAndClose() {
    if (createPayment.isPending) return;
    resetCreatePayment();
    onOpenChange(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId || createPayment.isPending) return;
    try {
      await createPayment.mutateAsync({
        businessPublicId,
        debtPublicId: currentDebt.public_id,
        data: {
          debt_public_id: currentDebt.public_id,
          amount,
          payment_date: paymentDate,
          payment_method_public_id: paymentMethodPublicId,
        },
      });
      onOpenChange(false);
    } catch (error) {
      if (!(error instanceof HttpError)) return;
      const message = paymentErrorMessage(error).toLocaleLowerCase();
      if (
        error.status === 409 ||
        error.status === 404 ||
        (error.status === 400 && (message.includes("saldo") || message.includes("liquidad")))
      ) {
        await refreshPaymentEffects(businessPublicId, currentDebt.public_id);
      }
    }
  }

  const requestError = createPayment.error ? paymentErrorMessage(createPayment.error) : null;
  const detailError = debtQuery.error ? paymentErrorMessage(debtQuery.error) : null;

  return <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl"><DialogHeader><DialogTitle>{copy.action}</DialogTitle><DialogDescription className="text-zinc-500">{currentDebt.direction === "receivable" ? "Registra un cobro recibido del cliente." : "Registra un pago realizado al proveedor."}</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-5">
      <dl className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2"><div><dt className="text-xs text-zinc-500">Tipo</dt><dd className="mt-1 text-sm text-white">{currentDebt.direction === "receivable" ? "Cuenta por cobrar" : "Cuenta por pagar"}</dd></div><div><dt className="text-xs text-zinc-500">Contraparte</dt><dd className="mt-1 text-sm font-medium text-white">{counterpartName(currentDebt)}</dd></div><div><dt className="text-xs text-zinc-500">Total</dt><dd className="mt-1 text-sm text-white">{formatDebtAmount(currentDebt.total_amount)}</dd></div><div><dt className="text-xs text-zinc-500">Pagado</dt><dd className="mt-1 text-sm text-white">{formatDebtAmount(currentDebt.paid_amount)}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-zinc-500">Saldo pendiente actual</dt><dd className="mt-1 text-lg font-semibold text-white">{formatDebtAmount(currentDebt.outstanding_amount)}</dd></div></dl>

      {debtQuery.isLoading && <p className="text-sm text-zinc-500">Actualizando saldo...</p>}
      {detailError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{detailError}</div>}
      {!debtEligible && debtQuery.isSuccess && <div role="alert" className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">Esta deuda ya no admite pagos porque está liquidada, no tiene saldo o la operación está anulada.</div>}

      <div className="space-y-2"><div className="flex items-center justify-between gap-3"><label htmlFor="debt-payment-amount" className="text-sm font-medium text-zinc-300">{copy.amount}</label><Button type="button" variant="ghost" size="sm" onClick={() => setAmount(currentDebt.outstanding_amount)} disabled={!debtEligible || createPayment.isPending} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">Pagar saldo completo</Button></div><Input id="debt-payment-amount" type="text" inputMode="decimal" value={amount} onChange={(event) => { const value = event.target.value; if (/^\d*(?:\.\d{0,2})?$/.test(value)) setAmount(value); }} disabled={!debtEligible || createPayment.isPending} aria-invalid={attemptedSubmit && !validAmount} className="h-11 border-white/10 bg-black/30 text-white" />{attemptedSubmit && !validAmount && <p className="text-xs text-red-400">Ingresa un importe mayor que cero y no superior al saldo pendiente.</p>}</div>

      <div className="space-y-2"><label htmlFor="debt-payment-method" className="text-sm font-medium text-zinc-300">Método de pago</label><select id="debt-payment-method" value={paymentMethodPublicId} onChange={(event) => setPaymentMethodPublicId(event.target.value)} disabled={!debtEligible || paymentMethodsQuery.isLoading || createPayment.isPending} aria-invalid={attemptedSubmit && !paymentMethodPublicId} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"><option value="">{paymentMethodsQuery.isLoading ? "Cargando métodos..." : "Selecciona un método"}</option>{paymentMethodsQuery.data?.results.map((method) => <option key={method.public_id} value={method.public_id}>{method.name} · {PAYMENT_METHOD_TYPE_LABELS[method.method_type]}</option>)}</select>{attemptedSubmit && !paymentMethodPublicId && <p className="text-xs text-red-400">Selecciona un método de pago.</p>}{paymentMethodsQuery.isError && <div className="flex items-center justify-between gap-3 text-sm text-red-300"><span>No fue posible cargar los métodos de pago.</span><Button type="button" variant="ghost" size="sm" onClick={() => paymentMethodsQuery.refetch()}>Reintentar</Button></div>}</div>

      <div className="space-y-2"><label htmlFor="debt-payment-date" className="text-sm font-medium text-zinc-300">Fecha de pago</label><DateInput id="debt-payment-date" pickerLabel="Abrir calendario de fecha de pago" value={paymentDate} max={today} onChange={(event) => setPaymentDate(event.target.value)} disabled={!debtEligible || createPayment.isPending} aria-invalid={attemptedSubmit && !validDate} className="h-11 border-white/10 bg-black/30 text-white" />{attemptedSubmit && !validDate && <p className="text-xs text-red-400">Selecciona una fecha válida que no sea futura.</p>}</div>

      {requestError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{requestError}</div>}
      <DialogFooter><Button type="button" variant="outline" onClick={resetAndClose} disabled={createPayment.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="submit" disabled={!canSubmit || createPayment.isPending} className="bg-red-500 text-white hover:bg-red-600">{createPayment.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Registrando...</> : copy.action}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}
