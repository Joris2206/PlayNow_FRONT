"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useCreateExpense } from "@/hooks/use-transactions";
import { findStatusByName } from "@/lib/catalog-status";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";

import {
  formatExpenseMoney,
  getExpenseErrorMessage,
} from "@/components/expenses/expenses-format";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/components/payment-methods/payment-methods-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PAYMENT_METHOD_PAGE_SIZE = 200;
const MONEY_INPUT_PATTERN = /^\d*(?:\.\d{0,2})?$/;
const MAX_EXPENSE_MINOR_UNITS = 999999999999n;

type CreateExpenseDialogProps = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export default function CreateExpenseDialog({
  businessPublicId,
  open,
  onOpenChange,
  onCreated,
}: CreateExpenseDialogProps) {
  const [concept, setConcept] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paymentMethodPublicId, setPaymentMethodPublicId] =
    useState("");
  const [invoiceSeries, setInvoiceSeries] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);

  const createExpense = useCreateExpense();
  const resetCreateExpense = createExpense.reset;
  const statusesQuery = useEntityStatuses(open);
  const activeStatus = findStatusByName(
    statusesQuery.data?.results ?? [],
    "Activo"
  );
  const paymentMethodsQuery = usePaymentMethods({
    businessPublicId:
      open && activeStatus ? businessPublicId : undefined,
    page: 1,
    pageSize: PAYMENT_METHOD_PAGE_SIZE,
    ordering: "name",
    statusPublicId: activeStatus?.public_id,
  });

  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethodsQuery.data?.results.find(
        (method) => method.public_id === paymentMethodPublicId
      ),
    [paymentMethodPublicId, paymentMethodsQuery.data]
  );

  const expenseMinorUnits = toMoneyMinorUnits(expenseAmount);
  const isAmountValid =
    expenseMinorUnits !== null &&
    expenseMinorUnits >= 1n &&
    expenseMinorUnits <= MAX_EXPENSE_MINOR_UNITS;
  const canSubmit = Boolean(
    businessPublicId &&
      activeStatus &&
      isAmountValid &&
      paymentMethodPublicId
  );
  const showAmountError =
    !isAmountValid && (attemptedSubmit || amountTouched);

  useEffect(() => {
    if (!open) {
      return;
    }

    setConcept("");
    setExpenseAmount("");
    setPaymentMethodPublicId("");
    setInvoiceSeries("");
    setInvoiceNumber("");
    setAttemptedSubmit(false);
    setAmountTouched(false);
    resetCreateExpense();
  }, [open, businessPublicId, resetCreateExpense]);

  useEffect(() => {
    if (!paymentMethodPublicId || !paymentMethodsQuery.isSuccess) {
      return;
    }

    if (
      !paymentMethodsQuery.data.results.some(
        (method) => method.public_id === paymentMethodPublicId
      )
    ) {
      setPaymentMethodPublicId("");
    }
  }, [
    paymentMethodPublicId,
    paymentMethodsQuery.data,
    paymentMethodsQuery.isSuccess,
  ]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createExpense.isPending) {
      return;
    }

    if (!nextOpen) {
      resetCreateExpense();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (
      !canSubmit ||
      !businessPublicId ||
      createExpense.isPending
    ) {
      return;
    }

    const normalizedConcept = concept.trim();
    const normalizedInvoiceSeries = invoiceSeries.trim();
    const normalizedInvoiceNumber = invoiceNumber.trim();

    try {
      await createExpense.mutateAsync({
        business_public_id: businessPublicId,
        type: "expense",
        payment_status: "paid",
        payment_method_public_id: paymentMethodPublicId,
        expense_amount: expenseAmount,
        ...(normalizedConcept
          ? { concept: normalizedConcept }
          : {}),
        ...(normalizedInvoiceSeries
          ? { invoice_series: normalizedInvoiceSeries }
          : {}),
        ...(normalizedInvoiceNumber
          ? { invoice_number: normalizedInvoiceNumber }
          : {}),
      });
      onCreated();
      onOpenChange(false);
    } catch {
      // React Query exposes the field or request error below.
    }
  }

  const missingActiveStatus =
    statusesQuery.isSuccess && !activeStatus;
  const guidance = !businessPublicId
    ? "No hay un negocio activo para registrar el gasto."
    : missingActiveStatus
      ? "No existe el estado Activo necesario para consultar métodos de pago."
      : !isAmountValid
        ? "Indica un importe válido entre 0.01 y 9999999999.99."
        : !paymentMethodPublicId
          ? "Selecciona un método de pago activo."
          : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Registra un gasto pagado. PlayNow API determinará el importe definitivo y su efecto financiero.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="expense-concept"
              className="text-sm font-medium text-zinc-300"
            >
              Concepto (opcional)
            </label>
            <Input
              id="expense-concept"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              placeholder="Ej. Pago mensual de energía"
              disabled={createExpense.isPending}
              className="h-11 border-white/10 bg-black/30 text-white"
            />
            <p className="text-xs text-zinc-500">
              Es recomendable para identificar el gasto posteriormente.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="expense-amount"
              className="text-sm font-medium text-zinc-300"
            >
              Importe
            </label>
            <Input
              id="expense-amount"
              type="text"
              inputMode="decimal"
              value={expenseAmount}
              onChange={(event) => {
                const value = event.target.value;

                if (MONEY_INPUT_PATTERN.test(value)) {
                  setExpenseAmount(value);
                }
              }}
              onBlur={() => setAmountTouched(true)}
              placeholder="0.00"
              disabled={createExpense.isPending}
              aria-invalid={showAmountError}
              aria-describedby={
                showAmountError ? "expense-amount-error" : undefined
              }
              className="h-11 border-white/10 bg-black/30 text-white"
            />
            {showAmountError && (
              <p id="expense-amount-error" className="text-xs text-red-400">
                Usa un importe entre 0.01 y 9999999999.99, con máximo 2 decimales.
              </p>
            )}
            {isAmountValid && (
              <p className="text-xs text-zinc-500">
                Importe ingresado: {formatExpenseMoney(expenseAmount)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="expense-payment-method"
              className="text-sm font-medium text-zinc-300"
            >
              Método de pago
            </label>
            <select
              id="expense-payment-method"
              value={paymentMethodPublicId}
              onChange={(event) =>
                setPaymentMethodPublicId(event.target.value)
              }
              disabled={
                statusesQuery.isLoading ||
                paymentMethodsQuery.isLoading ||
                createExpense.isPending ||
                !activeStatus
              }
              aria-invalid={attemptedSubmit && !paymentMethodPublicId}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"
            >
              <option value="">
                {statusesQuery.isLoading || paymentMethodsQuery.isLoading
                  ? "Cargando métodos..."
                  : "Selecciona un método"}
              </option>
              {paymentMethodsQuery.data?.results.map((method) => (
                <option key={method.public_id} value={method.public_id}>
                  {method.name} · {PAYMENT_METHOD_TYPE_LABELS[method.method_type]}
                </option>
              ))}
            </select>
            {attemptedSubmit && !paymentMethodPublicId && (
              <p className="text-xs text-red-400">
                Selecciona un método de pago activo.
              </p>
            )}
            {(statusesQuery.isError || paymentMethodsQuery.isError) && (
              <div className="flex items-center justify-between gap-3 text-sm text-red-300">
                <span>No fue posible cargar los métodos activos.</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (statusesQuery.isError) {
                      void statusesQuery.refetch();
                    } else {
                      void paymentMethodsQuery.refetch();
                    }
                  }}
                >
                  Reintentar
                </Button>
              </div>
            )}
            {paymentMethodsQuery.isSuccess &&
              paymentMethodsQuery.data.results.length === 0 && (
                <p className="text-xs text-amber-300">
                  No hay métodos de pago Activos disponibles para este negocio.
                </p>
              )}
            {selectedPaymentMethod?.method_type === "cash" && (
              <p className="text-xs text-emerald-400">
                Este gasto será considerado por PlayNow API en el cálculo de caja.
              </p>
            )}
          </div>

          <fieldset className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <legend className="px-1 text-sm font-medium text-zinc-300">
              Información de factura (opcional)
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="expense-invoice-series"
                  className="text-xs text-zinc-500"
                >
                  Serie
                </label>
                <Input
                  id="expense-invoice-series"
                  value={invoiceSeries}
                  onChange={(event) => setInvoiceSeries(event.target.value)}
                  maxLength={50}
                  disabled={createExpense.isPending}
                  className="border-white/10 bg-black/30 text-white"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="expense-invoice-number"
                  className="text-xs text-zinc-500"
                >
                  Número
                </label>
                <Input
                  id="expense-invoice-number"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  maxLength={100}
                  disabled={createExpense.isPending}
                  className="border-white/10 bg-black/30 text-white"
                />
              </div>
            </div>
          </fieldset>

          {createExpense.error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {getExpenseErrorMessage(
                createExpense.error,
                "No fue posible registrar el gasto."
              )}
            </div>
          )}

          {!createExpense.isPending && guidance && (
            <p className="text-sm text-zinc-400" aria-live="polite">
              {guidance}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createExpense.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || createExpense.isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {createExpense.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar gasto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
