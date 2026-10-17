"use client";

import { LoaderCircle } from "lucide-react";

import { useDeactivateBusinessMembership } from "@/hooks/use-business-memberships";

import { getUsersAccessMutationError } from "@/components/users-access/users-access-errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { BusinessMembershipListItem } from "@/types/business-membership";

type Props = {
  membership: BusinessMembershipListItem | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

export default function DeactivateMembershipDialog({
  membership,
  businessPublicId,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const mutation = useDeactivateBusinessMembership();
  const canSubmit = Boolean(
    membership?.is_active && businessPublicId && !mutation.isPending
  );
  const errorMessage = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible desactivar el acceso."
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!canSubmit || !membership || !businessPublicId) return;

    try {
      await mutation.mutateAsync({
        businessPublicId,
        membershipPublicId: membership.public_id,
      });
      onCompleted("El acceso local fue desactivado correctamente.");
      onOpenChange(false);
    } catch {
      // The dialog stays open and exposes the backend error for manual retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>¿Desactivar acceso?</DialogTitle>
          <DialogDescription className="text-zinc-400">
            La cuenta dejará de acceder a este Business. No se elimina el usuario global, el Employee, su historial ni sus accesos a otros Businesses.
          </DialogDescription>
        </DialogHeader>

        {membership && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium text-white">
              {membership.user_full_name || "Sin nombre"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{membership.user_email}</p>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={!canSubmit}>
            {mutation.isPending ? (
              <><LoaderCircle className="h-4 w-4 animate-spin" />Desactivando...</>
            ) : "Desactivar acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
