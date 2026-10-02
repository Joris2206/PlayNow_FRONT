"use client";

import { LoaderCircle } from "lucide-react";
import { formatCommissionMoney, getCommissionErrorMessage } from "@/components/commissions/commissions-format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useCommissionSettlement,
  useMarkCommissionSettlementPaid,
} from "@/hooks/use-commission-settlements";
import type { CommissionSettlement } from "@/types/commission";

type Props = { businessPublicId?: string; settlement: CommissionSettlement | null; open: boolean; onOpenChange: (open: boolean) => void; onPaid: () => void };

export default function MarkCommissionSettlementPaidDialog({ businessPublicId, settlement, open, onOpenChange, onPaid }: Props) {
  const markPaid = useMarkCommissionSettlementPaid();
  const settlementQuery = useCommissionSettlement(
    open ? businessPublicId : undefined,
    open ? settlement?.public_id : undefined
  );
  const current = settlementQuery.data ?? settlement;
  const canMarkPaid = Boolean(
    businessPublicId &&
      settlementQuery.isSuccess &&
      !settlementQuery.isFetching &&
      current?.status === "pending"
  );
  function handleOpenChange(nextOpen: boolean) { if (!nextOpen && markPaid.isPending) return; if (!nextOpen) markPaid.reset(); onOpenChange(nextOpen); }
  async function handleMarkPaid() {
    if (!businessPublicId || !current || !canMarkPaid || markPaid.isPending) return;
    try { await markPaid.mutateAsync({ publicId: current.public_id, businessPublicId }); onPaid(); markPaid.reset(); onOpenChange(false); } catch { /* Keep authoritative backend error visible. */ }
  }
  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent className="border-white/10 bg-zinc-950 text-white"><DialogHeader><DialogTitle>¿Marcar liquidación como pagada?</DialogTitle><DialogDescription className="text-zinc-500">Esta acción actualiza únicamente el estado de la liquidación. No registra movimientos de caja.</DialogDescription></DialogHeader>{current && <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><p className="font-medium text-white">{current.employee_name}</p><p className="mt-1 text-sm text-zinc-400">Neto pagable: {formatCommissionMoney(current.net_commission_payable, current.business_currency)}</p></div>}{settlementQuery.isLoading && <p className="text-sm text-zinc-500">Verificando el estado actual...</p>}{settlementQuery.error && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{getCommissionErrorMessage(settlementQuery.error, "No fue posible verificar la liquidación.")}</div>}{settlementQuery.isSuccess && current?.status !== "pending" && <div role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300">La liquidación ya no está pendiente y no puede marcarse nuevamente.</div>}{markPaid.error && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{getCommissionErrorMessage(markPaid.error, "No fue posible marcar la liquidación como pagada.")}</div>}<DialogFooter><Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={markPaid.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="button" onClick={handleMarkPaid} disabled={!canMarkPaid || markPaid.isPending} className="bg-emerald-600 text-white hover:bg-emerald-700">{markPaid.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Actualizando...</> : "Confirmar pago"}</Button></DialogFooter></DialogContent></Dialog>;
}
