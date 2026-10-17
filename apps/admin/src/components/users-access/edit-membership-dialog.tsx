"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useUpdateBusinessMembership } from "@/hooks/use-business-memberships";

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
  UpdateBusinessMembershipRequest,
} from "@/types/business-membership";

type Props = {
  membership: BusinessMembershipListItem | null;
  businessPublicId?: string;
  roles: readonly NonOwnerRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

function editableRole(membership: BusinessMembershipListItem | null) {
  return membership && membership.role !== "owner"
    ? membership.role
    : "viewer";
}

export default function EditMembershipDialog({
  membership,
  businessPublicId,
  roles,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [role, setRole] = useState<NonOwnerRole>(editableRole(membership));
  const [isActive, setIsActive] = useState(membership?.is_active ?? false);
  const mutation = useUpdateBusinessMembership();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setRole(editableRole(membership));
    setIsActive(membership?.is_active ?? false);
    resetMutation();
  }, [businessPublicId, membership, open, resetMutation]);

  const originalRole = editableRole(membership);
  const changedRole = membership && role !== originalRole;
  const changedActivity = membership && isActive !== membership.is_active;
  const hasChanges = Boolean(changedRole || changedActivity);
  const canSubmit = Boolean(
    membership &&
      businessPublicId &&
      membership.role !== "owner" &&
      roles.includes(role) &&
      hasChanges &&
      !mutation.isPending
  );
  const roleError = getUsersAccessFieldError(mutation.error, "role");
  const activityError = getUsersAccessFieldError(mutation.error, "is_active");
  const generalError = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible actualizar la membership."
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !businessPublicId || !membership) return;

    const data: UpdateBusinessMembershipRequest = {};
    if (changedRole) data.role = role;
    if (changedActivity) data.is_active = isActive;

    try {
      await mutation.mutateAsync({
        businessPublicId,
        membershipPublicId: membership.public_id,
        data,
      });
      onCompleted("La membership se actualizó correctamente.");
      onOpenChange(false);
    } catch {
      // The mutation preserves the selected changes for a manual retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Editar membership</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Cambia únicamente el rol local o el estado de acceso a este negocio.
          </DialogDescription>
        </DialogHeader>

        {membership && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">
                {membership.user_full_name || "Sin nombre"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{membership.user_email}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-membership-role" className="text-sm font-medium text-zinc-300">
                Rol local
              </label>
              <MembershipRoleSelect
                id="edit-membership-role"
                value={role}
                roles={roles}
                onChange={setRole}
                disabled={mutation.isPending}
                ariaInvalid={Boolean(roleError)}
                ariaDescribedBy={roleError ? "edit-membership-role-error" : undefined}
              />
              {roleError && (
                <p id="edit-membership-role-error" className="text-xs text-red-400">
                  {roleError}
                </p>
              )}
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={mutation.isPending}
                aria-invalid={Boolean(activityError)}
                className="mt-1 h-4 w-4 accent-red-500"
              />
              <span>
                <span className="block text-sm font-medium text-white">Acceso activo</span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">
                  Una membership inactiva no permite operar dentro de este Business.
                </span>
              </span>
            </label>
            {activityError && (
              <p className="text-xs text-red-400">{activityError}</p>
            )}

            {generalError && (
              <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {generalError}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit} className="bg-red-500 text-white hover:bg-red-600">
                {mutation.isPending ? (
                  <><LoaderCircle className="h-4 w-4 animate-spin" />Guardando...</>
                ) : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
