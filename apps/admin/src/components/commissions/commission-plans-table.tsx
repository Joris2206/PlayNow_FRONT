"use client";

import { Pencil, Power, Trash2 } from "lucide-react";
import {
  formatCommissionDate,
  getCommissionErrorMessage,
} from "@/components/commissions/commissions-format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatchCommissionPlan } from "@/hooks/use-commission-plans";
import { cn } from "@/lib/utils";
import type { CommissionPlan } from "@/types/commission";

type Props = {
  plans: CommissionPlan[];
  businessPublicId?: string;
  onEdit: (plan: CommissionPlan) => void;
  onDelete: (plan: CommissionPlan) => void;
};

export default function CommissionPlansTable({
  plans,
  businessPublicId,
  onEdit,
  onDelete,
}: Props) {
  const patchPlan = usePatchCommissionPlan();

  if (plans.length === 0) {
    return <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm text-zinc-500">No hay planes que coincidan con los filtros actuales.</div>;
  }

  return (
    <div className="space-y-4">
      {patchPlan.error && (
        <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {getCommissionErrorMessage(
            patchPlan.error,
            "No fue posible cambiar el estado del plan."
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <Table stickyHeader className="min-w-[900px]">
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="px-5 text-zinc-500">Empleado</TableHead>
              <TableHead className="px-5 text-right text-zinc-500">Porcentaje</TableHead>
              <TableHead className="px-5 text-zinc-500">Válido desde</TableHead>
              <TableHead className="px-5 text-zinc-500">Válido hasta</TableHead>
              <TableHead className="px-5 text-zinc-500">Estado</TableHead>
              <TableHead className="px-5 text-right text-zinc-500">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => {
              const pending =
                patchPlan.isPending &&
                patchPlan.variables?.publicId === plan.public_id;
              return (
                <TableRow key={plan.public_id} className="border-white/10">
                  <TableCell className="px-5 font-medium text-white">{plan.employee_name}</TableCell>
                  <TableCell className="px-5 text-right text-zinc-300">{plan.percentage}%</TableCell>
                  <TableCell className="px-5 text-zinc-300">{formatCommissionDate(plan.valid_from)}</TableCell>
                  <TableCell className="px-5 text-zinc-300">{plan.valid_until ? formatCommissionDate(plan.valid_until) : "Sin fecha final"}</TableCell>
                  <TableCell className="px-5">
                    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs", plan.is_active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400")}>{plan.is_active ? "Activo" : "Inactivo"}</span>
                  </TableCell>
                  <TableCell className="px-5">
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="icon" aria-label={`Editar plan de ${plan.employee_name}`} disabled={patchPlan.isPending} onClick={() => onEdit(plan)} className="text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" aria-label={`${plan.is_active ? "Desactivar" : "Activar"} plan de ${plan.employee_name}`} disabled={!businessPublicId || patchPlan.isPending} onClick={() => { if (!businessPublicId) return; void patchPlan.mutateAsync({ publicId: plan.public_id, businessPublicId, previousEmployeePublicId: plan.employee_public_id, data: { is_active: !plan.is_active } }).catch(() => undefined); }} className="text-zinc-400 hover:text-white"><Power className={cn("h-4 w-4", pending && "animate-pulse")} /></Button>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar plan de ${plan.employee_name}`} disabled={patchPlan.isPending} onClick={() => onDelete(plan)} className="text-zinc-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
