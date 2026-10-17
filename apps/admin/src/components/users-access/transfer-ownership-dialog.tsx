"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useTransferBusinessOwnership } from "@/hooks/use-business-memberships";

import MembershipRoleSelect from "@/components/users-access/membership-role-select";
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

import type {
  BusinessMembershipListItem,
  NonOwnerRole,
} from "@/types/business-membership";

type Props = {
  businessPublicId?: string;
  businessName?: string;
  owners: readonly BusinessMembershipListItem[];
  candidates: readonly BusinessMembershipListItem[];
  replacementRoles: readonly NonOwnerRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

export default function TransferOwnershipDialog({
  businessPublicId,
  businessName,
  owners,
  candidates,
  replacementRoles,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [fromMembershipPublicId, setFromMembershipPublicId] = useState("");
  const [toMembershipPublicId, setToMembershipPublicId] = useState("");
  const [fromRole, setFromRole] = useState<NonOwnerRole>("admin");
  const mutation = useTransferBusinessOwnership();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setFromMembershipPublicId("");
    setToMembershipPublicId("");
    setFromRole(replacementRoles[0] ?? "admin");
    resetMutation();
  }, [businessPublicId, open, replacementRoles, resetMutation]);

  const source = owners.find(
    (owner) => owner.public_id === fromMembershipPublicId
  );
  const availableTargets = candidates.filter(
    (candidate) => candidate.public_id !== fromMembershipPublicId
  );
  const target = availableTargets.find(
    (candidate) => candidate.public_id === toMembershipPublicId
  );
  const errors = {
    source: getUsersAccessFieldError(
      mutation.error,
      "from_membership_public_id"
    ),
    target: getUsersAccessFieldError(
      mutation.error,
      "to_membership_public_id"
    ),
    role: getUsersAccessFieldError(mutation.error, "from_role"),
  };
  const errorMessage = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible transferir la propiedad."
      )
    : null;
  const canSubmit = Boolean(
    businessPublicId && source && target && !mutation.isPending
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!businessPublicId || !source || !target || mutation.isPending) return;

    try {
      await mutation.mutateAsync({
        businessPublicId,
        fromMembershipPublicId: source.public_id,
        toMembershipPublicId: target.public_id,
        fromRole,
      });
      onCompleted("La propiedad fue transferida correctamente.");
      onOpenChange(false);
    } catch {
      // Preserve every selection for a deliberate retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Transferir propiedad</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Ejecuta una única transferencia atómica para {businessName ?? "el negocio activo"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="transfer-owner-source" className="text-sm font-medium text-zinc-300">Propietario de origen</label>
          <OwnershipMemberSelect
            id="transfer-owner-source"
            value={fromMembershipPublicId}
            memberships={owners}
            onChange={(value) => {
              setFromMembershipPublicId(value);
              if (value === toMembershipPublicId) setToMembershipPublicId("");
            }}
            disabled={mutation.isPending}
            ariaInvalid={Boolean(errors.source)}
            ariaDescribedBy={errors.source ? "transfer-owner-source-error" : undefined}
            placeholder="Selecciona el propietario actual"
          />
          {errors.source && <p id="transfer-owner-source-error" className="text-xs text-red-400">{errors.source}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="transfer-owner-target" className="text-sm font-medium text-zinc-300">Destinatario</label>
          <OwnershipMemberSelect
            id="transfer-owner-target"
            value={toMembershipPublicId}
            memberships={availableTargets}
            onChange={setToMembershipPublicId}
            disabled={mutation.isPending || !source}
            ariaInvalid={Boolean(errors.target)}
            ariaDescribedBy={errors.target ? "transfer-owner-target-error" : undefined}
            placeholder="Selecciona la membership destinataria"
          />
          {errors.target && <p id="transfer-owner-target-error" className="text-xs text-red-400">{errors.target}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="transfer-owner-role" className="text-sm font-medium text-zinc-300">Nuevo rol del propietario de origen</label>
          <MembershipRoleSelect
            id="transfer-owner-role"
            value={fromRole}
            roles={replacementRoles}
            onChange={setFromRole}
            disabled={mutation.isPending}
            ariaInvalid={Boolean(errors.role)}
            ariaDescribedBy={errors.role ? "transfer-owner-role-error" : undefined}
          />
          {errors.role && <p id="transfer-owner-role-error" className="text-xs text-red-400">{errors.role}</p>}
        </div>

        {source && target && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
            <p>{target.user_full_name || target.user_email} pasará a ser Owner.</p>
            <p>{source.user_full_name || source.user_email} conservará su cuenta, Employee, historial y acceso activo con el rol seleccionado.</p>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button>
          <Button type="button" onClick={handleConfirm} disabled={!canSubmit} className="bg-red-500 text-white hover:bg-red-600">
            {mutation.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Transfiriendo...</> : "Confirmar transferencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
