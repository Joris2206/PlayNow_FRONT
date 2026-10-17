"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useRemoveBusinessOwner } from "@/hooks/use-business-memberships";

import MembershipRoleSelect from "@/components/users-access/membership-role-select";
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
  owner: BusinessMembershipListItem | null;
  replacementRoles: readonly NonOwnerRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

export default function RemoveOwnerDialog({
  businessPublicId,
  owner,
  replacementRoles,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [replacementRole, setReplacementRole] =
    useState<NonOwnerRole>("admin");
  const mutation = useRemoveBusinessOwner();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setReplacementRole(replacementRoles[0] ?? "admin");
    resetMutation();
  }, [businessPublicId, open, owner, replacementRoles, resetMutation]);

  const roleError = getUsersAccessFieldError(
    mutation.error,
    "replacement_role"
  );
  const errorMessage = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible retirar la propiedad."
      )
    : null;
  const canSubmit = Boolean(
    businessPublicId && owner && !mutation.isPending
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!businessPublicId || !owner || mutation.isPending) return;

    try {
      await mutation.mutateAsync({
        businessPublicId,
        membershipPublicId: owner.public_id,
        replacementRole,
      });
      onCompleted("La propiedad fue retirada y la membership conservó su acceso.");
      onOpenChange(false);
    } catch {
      // Preserve the replacement role for a deliberate retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>¿Retirar propiedad?</DialogTitle>
          <DialogDescription className="text-zinc-400">
            La membership dejará de ser Owner, pero conservará su cuenta, Employee, historial y acceso al Business con el nuevo rol.
          </DialogDescription>
        </DialogHeader>

        {owner && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium text-white">
              {owner.user_full_name || owner.user_email}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{owner.user_email}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="remove-owner-role" className="text-sm font-medium text-zinc-300">
            Rol que conservará
          </label>
          <MembershipRoleSelect
            id="remove-owner-role"
            value={replacementRole}
            roles={replacementRoles}
            onChange={setReplacementRole}
            disabled={mutation.isPending}
            ariaInvalid={Boolean(roleError)}
            ariaDescribedBy={roleError ? "remove-owner-role-error" : undefined}
          />
          {roleError && (
            <p id="remove-owner-role-error" className="text-xs text-red-400">
              {roleError}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
          El último Owner efectivo no puede retirarse. El Backend verificará esta regla al confirmar.
        </div>

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
              <><LoaderCircle className="h-4 w-4 animate-spin" />Retirando...</>
            ) : "Retirar propiedad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
