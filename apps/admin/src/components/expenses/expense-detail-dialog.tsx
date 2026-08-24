"use client";

import { getCatalogStatusClassName } from "@/lib/catalog-status";
import { cn } from "@/lib/utils";

import {
  formatExpenseDate,
  formatExpenseInvoice,
  formatExpenseMoney,
} from "@/components/expenses/expenses-format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Transaction } from "@/types/transaction";

type ExpenseDetailDialogProps = {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ExpenseDetailDialog({
  transaction,
  open,
  onOpenChange,
}: ExpenseDetailDialogProps) {
  if (!transaction) {
    return null;
  }

  const invoice = formatExpenseInvoice(
    transaction.invoice_series,
    transaction.invoice_number
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle del gasto</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {invoice || "Gasto sin información de factura"}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-zinc-500">Fecha</dt>
            <dd className="mt-1 text-sm text-white">
              {formatExpenseDate(transaction.created_at)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">Método de pago</dt>
            <dd className="mt-1 text-sm text-white">
              {transaction.payment_method_name ?? "Sin método"}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">Estado</dt>
            <dd className="mt-1">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                  getCatalogStatusClassName(transaction.status_name)
                )}
              >
                {transaction.status_name}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">Factura</dt>
            <dd className="mt-1 text-sm text-white">
              {invoice || "Sin factura"}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">Creado por</dt>
            <dd className="mt-1 break-all text-sm text-white">
              {transaction.created_by_email}
            </dd>
          </div>

          {transaction.updated_by_email && (
            <div>
              <dt className="text-xs text-zinc-500">Última actualización</dt>
              <dd className="mt-1 text-sm text-white">
                {formatExpenseDate(transaction.updated_at)}
              </dd>
              <dd className="mt-1 break-all text-xs text-zinc-500">
                {transaction.updated_by_email}
              </dd>
            </div>
          )}
        </dl>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-500">Concepto</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">
            {transaction.concept || "Sin concepto"}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5">
          <span className="text-sm text-zinc-400">Importe definitivo</span>
          <strong className="text-xl text-white">
            {formatExpenseMoney(
              transaction.total_value,
              transaction.business_currency
            )}
          </strong>
        </div>
      </DialogContent>
    </Dialog>
  );
}
