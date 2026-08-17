"use client";

import { cn } from "@/lib/utils";
import { getCatalogStatusClassName } from "@/lib/catalog-status";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatSaleDate, formatSaleMoney } from "@/components/sales/sales-format";
import type { Transaction } from "@/types/transaction";

type Props = { transaction: Transaction | null; open: boolean; onOpenChange: (open: boolean) => void };

const PAYMENT_LABELS = { paid: "Pagada", partial: "Parcial", pending: "Pendiente" } as const;

export default function SaleDetailDialog({ transaction, open, onOpenChange }: Props) {
  if (!transaction) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalle de venta</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {transaction.invoice_number ? `Factura ${transaction.invoice_number}` : "Venta sin número de factura"}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div><dt className="text-xs text-zinc-500">Employee</dt><dd className="mt-1 text-sm text-white">{transaction.employee_name ?? "Sin nombre disponible"}</dd></div>
          <div><dt className="text-xs text-zinc-500">Cliente</dt><dd className="mt-1 text-sm text-white">{transaction.customer_name ?? "Sin cliente"}</dd></div>
          <div><dt className="text-xs text-zinc-500">Fecha</dt><dd className="mt-1 text-sm text-white">{formatSaleDate(transaction.created_at)}</dd></div>
          <div><dt className="text-xs text-zinc-500">Pago</dt><dd className="mt-1 text-sm text-white">{PAYMENT_LABELS[transaction.payment_status]}</dd></div>
          <div><dt className="text-xs text-zinc-500">Estado</dt><dd className="mt-1"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getCatalogStatusClassName(transaction.status_name))}>{transaction.status_name}</span></dd></div>
        </dl>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <Table className="min-w-[640px]">
            <TableHeader className="bg-white/[0.02]"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-4 text-zinc-500">Producto</TableHead><TableHead className="px-4 text-right text-zinc-500">Cantidad</TableHead><TableHead className="px-4 text-right text-zinc-500">Precio unitario</TableHead><TableHead className="px-4 text-right text-zinc-500">Subtotal</TableHead></TableRow></TableHeader>
            <TableBody>{transaction.details.map((detail) => <TableRow key={detail.public_id} className="border-white/10"><TableCell className="px-4 font-medium text-white">{detail.product_name}</TableCell><TableCell className="px-4 text-right text-zinc-300">{detail.quantity}</TableCell><TableCell className="px-4 text-right text-zinc-300">{formatSaleMoney(detail.unit_price, transaction.business_currency)}</TableCell><TableCell className="px-4 text-right font-medium text-white">{formatSaleMoney(detail.total_price, transaction.business_currency)}</TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
        <div className="flex justify-end text-lg font-semibold">Total: {formatSaleMoney(transaction.total_value, transaction.business_currency)}</div>
      </DialogContent>
    </Dialog>
  );
}
