"use client";

import { LoaderCircle } from "lucide-react";
import {
  formatCommissionDate,
  formatCommissionMoney,
  getCommissionErrorMessage,
} from "@/components/commissions/commissions-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateCommissionSettlement } from "@/hooks/use-commission-settlements";
import type {
  CommissionPreview,
  CommissionSettlement,
} from "@/types/commission";

type Props = {
  businessPublicId?: string;
  preview: CommissionPreview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (settlement: CommissionSettlement) => void;
};

export default function CreateCommissionSettlementDialog({
  businessPublicId,
  preview,
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const createSettlement = useCreateCommissionSettlement();
  const currency = preview?.business.currency ?? "";

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createSettlement.isPending) return;
    if (!nextOpen) createSettlement.reset();
    onOpenChange(nextOpen);
  }

  async function handleCreate() {
    if (!businessPublicId || !preview || createSettlement.isPending) return;
    try {
      const settlement = await createSettlement.mutateAsync({
        business_public_id: businessPublicId,
        employee_public_id: preview.employee.public_id,
        period_start: preview.period.date_from,
        period_end: preview.period.date_to,
      });
      onCreated(settlement);
      onOpenChange(false);
    } catch {
      // Preview does not guarantee creation; keep the backend error visible.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear liquidación</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Se guardarán los importes correspondientes al período seleccionado.
          </DialogDescription>
        </DialogHeader>
        {preview && (
          <dl className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2">
            <div><dt className="text-xs text-zinc-500">Empleado</dt><dd className="mt-1 text-sm font-medium text-white">{preview.employee.full_name}</dd></div>
            <div><dt className="text-xs text-zinc-500">Período</dt><dd className="mt-1 text-sm text-white">{formatCommissionDate(preview.period.date_from)} – {formatCommissionDate(preview.period.date_to)}</dd></div>
            <div><dt className="text-xs text-zinc-500">Ventas</dt><dd className="mt-1 text-sm text-white">{preview.sales_count} · {formatCommissionMoney(preview.sales_total, currency)}</dd></div>
            <div><dt className="text-xs text-zinc-500">Neto pagable preliminar</dt><dd className="mt-1 text-sm font-semibold text-white">{formatCommissionMoney(preview.net_commission_payable, currency)}</dd></div>
          </dl>
        )}
        {createSettlement.error && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{getCommissionErrorMessage(createSettlement.error, "No fue posible crear la liquidación.")}</div>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createSettlement.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button>
          <Button type="button" onClick={handleCreate} disabled={!preview || !businessPublicId || createSettlement.isPending} className="bg-red-500 text-white hover:bg-red-600">
            {createSettlement.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creando...</> : "Crear liquidación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
