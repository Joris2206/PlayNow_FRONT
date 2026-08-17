"use client";

import { useState } from "react";
import { Ban, Eye, MoreHorizontal, PackageSearch } from "lucide-react";
import { getCatalogStatusClassName, isTerminalCatalogStatus } from "@/lib/catalog-status";
import { hasAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import CancelPurchaseDialog from "@/components/purchases/cancel-purchase-dialog";
import PurchaseDetailDialog from "@/components/purchases/purchase-detail-dialog";
import { formatSaleDate, formatSaleMoney } from "@/components/sales/sales-format";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/types/transaction";

const PAYMENT_LABELS = { paid: "Pagada", partial: "Parcial", pending: "Pendiente" } as const;
const PAYMENT_CLASSES = { paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400", partial: "border-amber-500/20 bg-amber-500/10 text-amber-400", pending: "border-white/10 bg-white/5 text-zinc-300" } as const;

export default function PurchasesTable({ transactions }: { transactions: Transaction[] }) {
  const { activeMembership } = useAuth();
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [cancelling, setCancelling] = useState<Transaction | null>(null);
  const canCancel = hasAccess(activeMembership?.role, "purchases-cancel");
  if (transactions.length === 0) return <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center"><PackageSearch className="h-7 w-7 text-zinc-600" /><h3 className="mt-3 font-medium text-white">No hay compras</h3><p className="mt-2 text-sm text-zinc-500">No encontramos compras que coincidan con la búsqueda actual.</p></div>;
  return <>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"><Table className="min-w-[980px]"><TableHeader className="bg-white/[0.02]"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-5 text-zinc-500">Fecha</TableHead><TableHead className="px-5 text-zinc-500">Factura</TableHead><TableHead className="px-5 text-zinc-500">Proveedor</TableHead><TableHead className="px-5 text-right text-zinc-500">Total</TableHead><TableHead className="px-5 text-zinc-500">Estado de pago</TableHead><TableHead className="px-5 text-zinc-500">Estado</TableHead><TableHead className="w-16 px-5" /></TableRow></TableHeader><TableBody>{transactions.map((transaction) => { const mayCancel = canCancel && !isTerminalCatalogStatus(transaction.status_name); const invoice = [transaction.invoice_series, transaction.invoice_number].filter(Boolean).join("-"); return <TableRow key={transaction.public_id} className="border-white/10 hover:bg-white/[0.025]"><TableCell className="px-5 text-zinc-300">{formatSaleDate(transaction.created_at)}</TableCell><TableCell className="px-5 text-zinc-400">{invoice || "—"}</TableCell><TableCell className="px-5 font-medium text-white">{transaction.supplier_name ?? "Sin proveedor"}</TableCell><TableCell className="px-5 text-right font-semibold text-white">{formatSaleMoney(transaction.total_value, transaction.business_currency)}</TableCell><TableCell className="px-5"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", PAYMENT_CLASSES[transaction.payment_status])}>{PAYMENT_LABELS[transaction.payment_status]}</span></TableCell><TableCell className="px-5"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getCatalogStatusClassName(transaction.status_name))}>{transaction.status_name}</span></TableCell><TableCell className="px-5 text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label="Abrir acciones de compra" className="text-zinc-500 hover:bg-white/5 hover:text-white"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52 border-white/10 bg-zinc-950 text-zinc-300"><DropdownMenuLabel className="text-xs text-zinc-500">Acciones</DropdownMenuLabel><DropdownMenuItem onSelect={() => setDetail(transaction)}><Eye />Ver detalle</DropdownMenuItem>{mayCancel && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => setCancelling(transaction)}><Ban />Anular compra</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>; })}</TableBody></Table></div>
    <PurchaseDetailDialog transaction={detail} open={Boolean(detail)} onOpenChange={(nextOpen) => { if (!nextOpen) setDetail(null); }} />
    <CancelPurchaseDialog transaction={cancelling} businessPublicId={activeMembership?.business_public_id} open={Boolean(cancelling)} onOpenChange={(nextOpen) => { if (!nextOpen) setCancelling(null); }} />
  </>;
}
