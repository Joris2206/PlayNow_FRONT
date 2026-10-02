"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import {
  COMMISSION_SETTLEMENT_STATUS_LABELS,
  commissionSettlementStatusClassName,
  formatCommissionDate,
  formatCommissionDateTime,
  formatCommissionMoney,
  getCommissionErrorMessage,
} from "@/components/commissions/commissions-format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCommissionSettlement } from "@/hooks/use-commission-settlements";
import { cn } from "@/lib/utils";
import type { CommissionSettlement } from "@/types/commission";

type Props = { businessPublicId?: string; settlement: CommissionSettlement | null; open: boolean; onOpenChange: (open: boolean) => void; onMarkPaid: (settlement: CommissionSettlement) => void };

export default function CommissionSettlementDetailDialog({ businessPublicId, settlement, open, onOpenChange, onMarkPaid }: Props) {
  const query = useCommissionSettlement(open ? businessPublicId : undefined, open ? settlement?.public_id : undefined);
  const current = query.data;
  const moneyRows = current ? [
    ["Ventas", current.sales_total], ["Comisión bruta", current.commission_total], ["Adelantos", current.employee_advances], ["Reintegros", current.employee_repayments], ["Balance de adelantos", current.advance_balance], ["Neto pagable", current.net_commission_payable], ["Balance restante", current.remaining_advance_balance],
  ] : [];
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-4xl"><DialogHeader><DialogTitle>Detalle de liquidación</DialogTitle><DialogDescription className="text-zinc-500">Consulta la información registrada para esta liquidación.</DialogDescription></DialogHeader>{query.isLoading && <div className="flex min-h-40 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /></div>}{query.isError && <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center"><AlertCircle className="mx-auto h-6 w-6 text-red-400" /><p className="mt-3 text-sm text-red-300">{getCommissionErrorMessage(query.error, "No fue posible cargar la liquidación.")}</p><Button type="button" variant="outline" onClick={() => query.refetch()} className="mt-4 border-white/10 bg-transparent text-white">Reintentar</Button></div>}{current && <div className="space-y-5"><dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-zinc-500">Empleado</dt><dd className="mt-1 text-sm font-medium text-white">{current.employee_name}</dd></div><div><dt className="text-xs text-zinc-500">Cargo</dt><dd className="mt-1 text-sm text-white">{current.employee_position || "—"}</dd></div><div><dt className="text-xs text-zinc-500">Período</dt><dd className="mt-1 text-sm text-white">{formatCommissionDate(current.period_start)} – {formatCommissionDate(current.period_end)}</dd></div><div><dt className="text-xs text-zinc-500">Estado</dt><dd className="mt-1"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs", commissionSettlementStatusClassName(current.status))}>{COMMISSION_SETTLEMENT_STATUS_LABELS[current.status]}</span></dd></div><div><dt className="text-xs text-zinc-500">Cantidad de ventas</dt><dd className="mt-1 text-sm text-white">{current.sales_count}</dd></div><div><dt className="text-xs text-zinc-500">Porcentaje</dt><dd className="mt-1 text-sm text-white">{current.commission_percentage}%</dd></div><div><dt className="text-xs text-zinc-500">Creada por</dt><dd className="mt-1 text-sm text-white">{current.created_by_name}</dd></div><div><dt className="text-xs text-zinc-500">Creada</dt><dd className="mt-1 text-sm text-white">{formatCommissionDateTime(current.created_at)}</dd></div><div><dt className="text-xs text-zinc-500">Pagada</dt><dd className="mt-1 text-sm text-white">{formatCommissionDateTime(current.paid_at)}</dd></div><div><dt className="text-xs text-zinc-500">Actualizada</dt><dd className="mt-1 text-sm text-white">{formatCommissionDateTime(current.updated_at)}</dd></div></dl><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{moneyRows.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4"><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-2 font-medium text-white">{formatCommissionMoney(value, current.business_currency)}</dd></div>)}</dl>{current.status === "pending" && <div className="flex justify-end"><Button type="button" onClick={() => onMarkPaid(current)} className="bg-emerald-600 text-white hover:bg-emerald-700">Marcar como pagada</Button></div>}</div>}</DialogContent></Dialog>;
}
