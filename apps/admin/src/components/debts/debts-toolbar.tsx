"use client";

import { type KeyboardEvent, useRef } from "react";

import { cn } from "@/lib/utils";
import { useStickyToolbarOffset } from "@/hooks/use-sticky-toolbar-offset";
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
const transactionTypes = ["sale", "purchase"] as const;

export const DEBT_TAB_IDS = {
  sale: {
    tab: "debts-tab-sale",
    panel: "debts-panel-sale",
  },
  purchase: {
    tab: "debts-tab-purchase",
    panel: "debts-panel-purchase",
  },
} as const;

export default function DebtsToolbar({ transactionType, settlement, pageSize, onTransactionTypeChange, onSettlementChange, onPageSizeChange }: Props) {
  const toolbarRef = useStickyToolbarOffset<HTMLDivElement>();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % transactionTypes.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + transactionTypes.length) % transactionTypes.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = transactionTypes.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    onTransactionTypeChange(transactionTypes[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return <div ref={toolbarRef} className="sticky top-20 z-20 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
    <div role="tablist" aria-label="Tipo de cartera" className="grid gap-2 rounded-xl bg-black/30 p-1 sm:grid-cols-2">
      {transactionTypes.map((type, index) => {
        const selected = transactionType === type;

        return (
          <button
            key={type}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={DEBT_TAB_IDS[type].tab}
            type="button"
            role="tab"
            aria-controls={DEBT_TAB_IDS[type].panel}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onTransactionTypeChange(type)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={cn(
              tabClassName,
              selected
                ? "bg-red-500 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            {type === "sale" ? "Cuentas por cobrar" : "Cuentas por pagar"}
          </button>
        );
      })}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400"><span>Estado financiero</span><select value={settlement} onChange={(event) => onSettlementChange(event.target.value as DebtSettlementFilter)} aria-label="Filtrar por estado financiero" className="bg-transparent font-medium text-white outline-none"><option value="open" className="bg-zinc-950">Pendientes</option><option value="settled" className="bg-zinc-950">Liquidadas</option><option value="all" className="bg-zinc-950">Todas</option></select></label>
      <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400"><span>Por página</span><select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} aria-label="Cantidad de deudas por página" className="bg-transparent font-medium text-white outline-none"><option value={10} className="bg-zinc-950">10</option><option value={20} className="bg-zinc-950">20</option><option value={50} className="bg-zinc-950">50</option></select></label>
    </div>
  </div>;
}
