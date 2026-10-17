"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useAddExistingBusinessMember } from "@/hooks/use-business-memberships";

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
import { Input } from "@/components/ui/input";

import type { NonOwnerRole } from "@/types/business-membership";

type Props = {
  businessPublicId?: string;
  roles: readonly NonOwnerRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AddExistingMemberDialog({
  businessPublicId,
  roles,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<NonOwnerRole>(roles[0] ?? "viewer");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const mutation = useAddExistingBusinessMember();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setRole(roles[0] ?? "viewer");
    setAttemptedSubmit(false);
    resetMutation();
  }, [businessPublicId, open, resetMutation, roles]);

  const normalizedEmail = email.trim().toLowerCase();
  const validEmail = isValidEmail(normalizedEmail);
  const canSubmit = Boolean(
    businessPublicId && validEmail && roles.includes(role) && !mutation.isPending
  );
  const emailError =
    getUsersAccessFieldError(mutation.error, "email") ??
    (attemptedSubmit && !validEmail
      ? "Ingresa un correo electrónico válido."
      : null);
  const roleError = getUsersAccessFieldError(mutation.error, "role");
  const generalError = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible agregar el usuario al negocio."
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId) return;

    try {
      await mutation.mutateAsync({
        businessPublicId,
        data: { email: normalizedEmail, role },
      });
      onCompleted("El acceso se agregó o reactivó correctamente.");
      onOpenChange(false);
    } catch {
      // The mutation preserves the form and exposes the backend error below.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Agregar usuario existente</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Agrega una cuenta activa existente o reactiva su acceso local. No se creará un Employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="existing-member-email" className="text-sm font-medium text-zinc-300">
              Correo electrónico
            </label>
            <Input
              id="existing-member-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={mutation.isPending}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "existing-member-email-error" : undefined}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
            {emailError && (
              <p id="existing-member-email-error" className="text-xs text-red-400">
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="existing-member-role" className="text-sm font-medium text-zinc-300">
              Rol local
            </label>
            <MembershipRoleSelect
              id="existing-member-role"
              value={role}
              roles={roles}
              onChange={setRole}
              disabled={mutation.isPending}
              ariaInvalid={Boolean(roleError)}
              ariaDescribedBy={roleError ? "existing-member-role-error" : undefined}
            />
            {roleError && (
              <p id="existing-member-role-error" className="text-xs text-red-400">
                {roleError}
              </p>
            )}
          </div>

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
                <><LoaderCircle className="h-4 w-4 animate-spin" />Agregando...</>
              ) : "Agregar acceso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
