"use client";

import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

export type DebtSettlementFilter = "open" | "settled" | "all";

type Props = {
  transactionType: Extract<TransactionType, "sale" | "purchase">;
  settlement: DebtSettlementFilter;
  pageSize: number;
  onTransactionTypeChange: (value: Extract<TransactionType, "sale" | "purchase">) => void;
  onSettlementChange: (value: DebtSettlementFilter) => void;
  onPageSizeChange: (value: number) => void;
};

const tabClassName = "rounded-lg px-4 py-2.5 text-sm font-medium transition";

export default function DebtsToolbar({ transactionType, settlement, pageSize, onTransactionTypeChange, onSettlementChange, onPageSizeChange }: Props) {
  return <div className="sticky top-20 z-20 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
    <div role="tablist" aria-label="Tipo de cartera" className="grid gap-2 rounded-xl bg-black/30 p-1 sm:grid-cols-2">
      <button type="button" role="tab" aria-selected={transactionType === "sale"} onClick={() => onTransactionTypeChange("sale")} className={cn(tabClassName, transactionType === "sale" ? "bg-red-500 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white")}>Cuentas por cobrar</button>
      <button type="button" role="tab" aria-selected={transactionType === "purchase"} onClick={() => onTransactionTypeChange("purchase")} className={cn(tabClassName, transactionType === "purchase" ? "bg-red-500 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white")}>Cuentas por pagar</button>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400"><span>Estado financiero</span><select value={settlement} onChange={(event) => onSettlementChange(event.target.value as DebtSettlementFilter)} aria-label="Filtrar por estado financiero" className="bg-transparent font-medium text-white outline-none"><option value="open" className="bg-zinc-950">Pendientes</option><option value="settled" className="bg-zinc-950">Liquidadas</option><option value="all" className="bg-zinc-950">Todas</option></select></label>
      <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400"><span>Por página</span><select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} aria-label="Cantidad de deudas por página" className="bg-transparent font-medium text-white outline-none"><option value={10} className="bg-zinc-950">10</option><option value={20} className="bg-zinc-950">20</option><option value={50} className="bg-zinc-950">50</option></select></label>
    </div>
  </div>;
}
