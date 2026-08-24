"use client";

import { LoaderCircle } from "lucide-react";

import { useDeleteEmployee } from "@/hooks/use-employees";

import { getEmployeeErrorMessage } from "@/components/employees/employees-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Employee } from "@/types/employee";

type Props = {
  employee: Employee | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteEmployeeDialog({
  employee,
  businessPublicId,
  open,
  onOpenChange,
}: Props) {
  const deleteEmployee = useDeleteEmployee();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && deleteEmployee.isPending) return;
    if (!nextOpen) deleteEmployee.reset();
    onOpenChange(nextOpen);
  }

  async function handleDelete() {
    if (!employee || !businessPublicId || deleteEmployee.isPending) return;

    try {
      await deleteEmployee.mutateAsync({
        publicId: employee.public_id,
        businessPublicId,
      });
      onOpenChange(false);
    } catch {
      // Keep the dialog open so the request error remains visible.
    }
  }

  const errorMessage = deleteEmployee.error
    ? getEmployeeErrorMessage(
        deleteEmployee.error,
        "No fue posible eliminar el empleado."
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>¿Eliminar “{employee?.full_name}”?</DialogTitle>
          <DialogDescription className="text-zinc-500">
            El empleado pasará a estado Eliminado. No se elimina su historial: las transacciones, cajas y demás registros históricos permanecerán.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={deleteEmployee.isPending} className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancelar</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={!employee || !businessPublicId || deleteEmployee.isPending}>
            {deleteEmployee.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Eliminando...</> : "Eliminar empleado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
