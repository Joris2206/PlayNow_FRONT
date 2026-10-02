"use client";

import { LoaderCircle } from "lucide-react";
import { getCommissionErrorMessage } from "@/components/commissions/commissions-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCommissionPlan } from "@/hooks/use-commission-plans";
import type { CommissionPlan } from "@/types/commission";

type Props = {
  businessPublicId?: string;
  plan: CommissionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteCommissionPlanDialog({
  businessPublicId,
  plan,
  open,
  onOpenChange,
}: Props) {
  const deletePlan = useDeleteCommissionPlan();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && deletePlan.isPending) return;
    if (!nextOpen) deletePlan.reset();
    onOpenChange(nextOpen);
  }

  async function handleDelete() {
    if (!businessPublicId || !plan || deletePlan.isPending) return;
    try {
      await deletePlan.mutateAsync({
        publicId: plan.public_id,
        businessPublicId,
        employeePublicId: plan.employee_public_id,
      });
      onOpenChange(false);
    } catch {
      // The mutation error remains visible in this dialog.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>¿Eliminar este plan?</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Se eliminará el plan de {plan?.employee_name ?? "este empleado"}.
            Los settlements históricos no se modificarán.
          </DialogDescription>
        </DialogHeader>
        {deletePlan.error && (
          <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {getCommissionErrorMessage(
              deletePlan.error,
              "No fue posible eliminar el plan."
            )}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={deletePlan.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={!plan || !businessPublicId || deletePlan.isPending}>
            {deletePlan.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Eliminando...</> : "Eliminar plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
