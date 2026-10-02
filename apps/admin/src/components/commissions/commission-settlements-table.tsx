"use client";

import { Banknote, Eye } from "lucide-react";
import {
  COMMISSION_SETTLEMENT_STATUS_LABELS,
  commissionSettlementStatusClassName,
  formatCommissionDate,
  formatCommissionDateTime,
  formatCommissionMoney,
} from "@/components/commissions/commissions-format";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CommissionSettlement } from "@/types/commission";

type Props = {
  settlements: CommissionSettlement[];
  onView: (settlement: CommissionSettlement) => void;
  onMarkPaid: (settlement: CommissionSettlement) => void;
};

export default function CommissionSettlementsTable({ settlements, onView, onMarkPaid }: Props) {
  if (settlements.length === 0) return <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm text-zinc-500">No hay liquidaciones que coincidan con los filtros actuales.</div>;
  return <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]"><Table stickyHeader className="min-w-[1100px]"><TableHeader className="bg-white/[0.02]"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-5 text-zinc-500">Empleado</TableHead><TableHead className="px-5 text-zinc-500">Período</TableHead><TableHead className="px-5 text-right text-zinc-500">Ventas</TableHead><TableHead className="px-5 text-right text-zinc-500">Comisión</TableHead><TableHead className="px-5 text-right text-zinc-500">Neto pagable</TableHead><TableHead className="px-5 text-zinc-500">Estado</TableHead><TableHead className="px-5 text-zinc-500">Pagada</TableHead><TableHead className="px-5 text-right text-zinc-500">Acciones</TableHead></TableRow></TableHeader><TableBody>{settlements.map((settlement) => <TableRow key={settlement.public_id} className="border-white/10"><TableCell className="px-5 font-medium text-white">{settlement.employee_name}</TableCell><TableCell className="px-5 text-zinc-300">{formatCommissionDate(settlement.period_start)} – {formatCommissionDate(settlement.period_end)}</TableCell><TableCell className="px-5 text-right text-zinc-300">{settlement.sales_count} · {formatCommissionMoney(settlement.sales_total, settlement.business_currency)}</TableCell><TableCell className="px-5 text-right text-zinc-300">{formatCommissionMoney(settlement.commission_total, settlement.business_currency)}</TableCell><TableCell className="px-5 text-right font-semibold text-white">{formatCommissionMoney(settlement.net_commission_payable, settlement.business_currency)}</TableCell><TableCell className="px-5"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs", commissionSettlementStatusClassName(settlement.status))}>{COMMISSION_SETTLEMENT_STATUS_LABELS[settlement.status]}</span></TableCell><TableCell className="px-5 text-zinc-400">{formatCommissionDateTime(settlement.paid_at)}</TableCell><TableCell className="px-5"><div className="flex justify-end gap-1"><Button type="button" variant="ghost" size="icon" aria-label={`Ver liquidación de ${settlement.employee_name}`} onClick={() => onView(settlement)} className="text-zinc-400 hover:text-white"><Eye className="h-4 w-4" /></Button>{settlement.status === "pending" && <Button type="button" variant="ghost" size="icon" aria-label={`Marcar como pagada la liquidación de ${settlement.employee_name}`} onClick={() => onMarkPaid(settlement)} className="text-zinc-400 hover:text-emerald-400"><Banknote className="h-4 w-4" /></Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>;
}
