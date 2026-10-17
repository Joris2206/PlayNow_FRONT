"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { usePromoteBusinessOwner } from "@/hooks/use-business-memberships";

import OwnershipMemberSelect from "@/components/users-access/ownership-member-select";
import {
  getUsersAccessFieldError,
  getUsersAccessMutationError,
} from "@/components/users-access/users-access-errors";
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
  businessPublicId?: string;
  businessName?: string;
  candidates: readonly BusinessMembershipListItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

export default function PromoteOwnerDialog({
  businessPublicId,
  businessName,
  candidates,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [membershipPublicId, setMembershipPublicId] = useState("");
  const mutation = usePromoteBusinessOwner();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setMembershipPublicId("");
    resetMutation();
  }, [businessPublicId, open, resetMutation]);

  const selected = candidates.find(
    (candidate) => candidate.public_id === membershipPublicId
  );
  const fieldError = getUsersAccessFieldError(
    mutation.error,
    "membership_public_id"
  );
  const errorMessage = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible agregar al propietario."
      )
    : null;
  const canSubmit = Boolean(
    businessPublicId && selected && !mutation.isPending
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!businessPublicId || !selected || mutation.isPending) return;

    try {
      await mutation.mutateAsync({
        businessPublicId,
        membershipPublicId: selected.public_id,
      });
      onCompleted("El nuevo propietario fue agregado correctamente.");
      onOpenChange(false);
    } catch {
      // Preserve the selected membership for a deliberate retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Agregar propietario</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Promueve una membership activa existente mediante la operación especializada de Ownership.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="promote-owner-membership" className="text-sm font-medium text-zinc-300">
            Usuario
          </label>
          <OwnershipMemberSelect
            id="promote-owner-membership"
            value={membershipPublicId}
            memberships={candidates}
            onChange={setMembershipPublicId}
            disabled={mutation.isPending}
            ariaInvalid={Boolean(fieldError)}
            ariaDescribedBy={fieldError ? "promote-owner-membership-error" : undefined}
            placeholder="Selecciona una membership"
          />
          {fieldError && (
            <p id="promote-owner-membership-error" className="text-xs text-red-400">
              {fieldError}
            </p>
          )}
        </div>

        {selected && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-medium">{selected.user_full_name || selected.user_email}</p>
            <p className="mt-1 leading-6">
              Pasará a ser propietario de {businessName ?? "este negocio"}. Su User, Employee e historial no se modifican.
            </p>
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
          <Button type="button" onClick={handleConfirm} disabled={!canSubmit} className="bg-red-500 text-white hover:bg-red-600">
            {mutation.isPending ? (
              <><LoaderCircle className="h-4 w-4 animate-spin" />Agregando...</>
            ) : "Agregar propietario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
