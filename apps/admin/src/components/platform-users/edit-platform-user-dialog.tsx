"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useUpdatePlatformUser } from "@/hooks/use-platform-users";

import {
  getPlatformUserError,
  getPlatformUserFieldError,
} from "@/components/platform-users/platform-user-errors";
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

import type {
  PlatformUser,
  UpdatePlatformUserRequest,
} from "@/types/platform-user";

type Props = {
  user: PlatformUser | null;
  currentUserPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

export default function EditPlatformUserDialog({
  user,
  currentUserPublicId,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const mutation = useUpdatePlatformUser();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open || !user) return;
    setEmail(user.email);
    setFullName(user.full_name);
    resetMutation();
  }, [open, resetMutation, user]);

  const normalizedEmail = email.trim();
  const normalizedName = fullName.trim();
  const changedEmail = Boolean(user && normalizedEmail !== user.email);
  const changedName = Boolean(user && normalizedName !== user.full_name);
  const canSubmit = Boolean(
    user &&
      normalizedEmail &&
      normalizedName &&
      (changedEmail || changedName) &&
      !mutation.isPending
  );
  const emailError = getPlatformUserFieldError(mutation.error, "email");
  const nameError = getPlatformUserFieldError(mutation.error, "full_name");
  const generalError = mutation.error
    ? getPlatformUserError(
        mutation.error,
        "No fue posible actualizar el usuario."
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !user) return;

    const data: UpdatePlatformUserRequest = {};
    if (changedEmail) data.email = normalizedEmail;
    if (changedName) data.full_name = normalizedName;

    try {
      await mutation.mutateAsync({
        publicId: user.public_id,
        isCurrentUser: user.public_id === currentUserPublicId,
        data,
      });
      onCompleted("La identidad global fue actualizada.");
      onOpenChange(false);
    } catch {
      // Keep the form values available for a deliberate retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Editar identidad global</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Solo se modifican el nombre y el correo globales. Esto no cambia memberships, roles ni Employees.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="platform-user-name" className="text-sm font-medium text-zinc-300">
                Nombre completo
              </label>
              <Input
                id="platform-user-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={mutation.isPending}
                aria-invalid={Boolean(nameError)}
                className="border-white/10 bg-white/[0.03]"
              />
              {nameError && <p className="text-xs text-red-400">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="platform-user-email" className="text-sm font-medium text-zinc-300">
                Correo electrónico
              </label>
              <Input
                id="platform-user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={mutation.isPending}
                aria-invalid={Boolean(emailError)}
                className="border-white/10 bg-white/[0.03]"
              />
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
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
