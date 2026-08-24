"use client";

import { useState } from "react";
import { Ban, Eye, MoreHorizontal, ReceiptText } from "lucide-react";

import { isTerminalCatalogStatus, getCatalogStatusClassName } from "@/lib/catalog-status";
import { cn } from "@/lib/utils";

import CancelExpenseDialog from "@/components/expenses/cancel-expense-dialog";
import ExpenseDetailDialog from "@/components/expenses/expense-detail-dialog";
import {
  formatExpenseDate,
  formatExpenseInvoice,
  formatExpenseMoney,
} from "@/components/expenses/expenses-format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Transaction } from "@/types/transaction";

type ExpensesTableProps = {
  transactions: Transaction[];
  businessPublicId?: string;
  canCancel: boolean;
};

export default function ExpensesTable({
  transactions,
  businessPublicId,
  canCancel,
}: ExpensesTableProps) {
  const [detailTransaction, setDetailTransaction] =
    useState<Transaction | null>(null);
  const [cancellingTransaction, setCancellingTransaction] =
    useState<Transaction | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <ReceiptText className="h-6 w-6" />
        </div>
        <h3 className="font-medium text-white">No hay gastos</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos gastos que coincidan con la búsqueda actual.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table className="min-w-[1040px]">
            <TableHeader className="border-b border-white/10 bg-white/[0.02]">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="px-5 text-zinc-500">Fecha</TableHead>
                <TableHead className="px-5 text-zinc-500">Concepto</TableHead>
                <TableHead className="px-5 text-right text-zinc-500">Importe</TableHead>
                <TableHead className="px-5 text-zinc-500">Método</TableHead>
                <TableHead className="px-5 text-zinc-500">Factura</TableHead>
                <TableHead className="px-5 text-zinc-500">Estado</TableHead>
                <TableHead className="w-16 px-5" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {transactions.map((transaction) => {
                const invoice = formatExpenseInvoice(
                  transaction.invoice_series,
                  transaction.invoice_number
                );
                const mayCancel =
                  canCancel &&
                  !isTerminalCatalogStatus(transaction.status_name);

                return (
                  <TableRow
                    key={transaction.public_id}
                    className="border-white/10 hover:bg-white/[0.025]"
                  >
                    <TableCell className="px-5 text-zinc-300">
                      {formatExpenseDate(transaction.created_at)}
                    </TableCell>
                    <TableCell className="max-w-72 px-5 font-medium text-white">
                      <span className="block truncate" title={transaction.concept || "Sin concepto"}>
                        {transaction.concept || "Sin concepto"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 text-right font-semibold text-white">
                      {formatExpenseMoney(
                        transaction.total_value,
                        transaction.business_currency
                      )}
                    </TableCell>
                    <TableCell className="px-5 text-zinc-300">
                      {transaction.payment_method_name ?? "Sin método"}
                    </TableCell>
                    <TableCell className="px-5 text-zinc-400">
                      {invoice || "Sin factura"}
                    </TableCell>
                    <TableCell className="px-5">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                          getCatalogStatusClassName(transaction.status_name)
                        )}
                      >
                        {transaction.status_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Abrir acciones del gasto"
                            className="text-zinc-500 hover:bg-white/5 hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-52 border-white/10 bg-zinc-950 text-zinc-300"
                        >
                          <DropdownMenuLabel className="text-xs text-zinc-500">
                            Acciones
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => setDetailTransaction(transaction)}
                          >
                            <Eye />
                            Ver detalle
                          </DropdownMenuItem>

                          {mayCancel && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() =>
                                  setCancellingTransaction(transaction)
                                }
                              >
                                <Ban />
                                Anular gasto
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <ExpenseDetailDialog
        transaction={detailTransaction}
        open={Boolean(detailTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailTransaction(null);
          }
        }}
      />

      <CancelExpenseDialog
        transaction={cancellingTransaction}
        businessPublicId={businessPublicId}
        open={Boolean(cancellingTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setCancellingTransaction(null);
          }
        }}
      />
    </>
  );
}
