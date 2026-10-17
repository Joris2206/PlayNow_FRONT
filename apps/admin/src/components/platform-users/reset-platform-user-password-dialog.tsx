"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useResetPlatformUserPassword } from "@/hooks/use-platform-users";

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

import type { PlatformUser } from "@/types/platform-user";

type Props = {
  user: PlatformUser | null;
  currentUserPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

export default function ResetPlatformUserPasswordDialog({
  user,
  currentUserPublicId,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const mutation = useResetPlatformUserPassword();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmation("");
      resetMutation();
    }
  }, [open, resetMutation]);

  const isSelf = user?.public_id === currentUserPublicId;
  const canSubmit = Boolean(
    user && !isSelf && password && confirmation && !mutation.isPending
  );
  const passwordError = getPlatformUserFieldError(mutation.error, "password");
  const confirmationError = getPlatformUserFieldError(
    mutation.error,
    "password_confirmation"
  );
  const errorMessage = mutation.error
    ? getPlatformUserError(
        mutation.error,
        "No fue posible restablecer la contraseña."
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !user) return;

    try {
      await mutation.resetPassword(user.public_id, {
        password,
        password_confirmation: confirmation,
      });
      setPassword("");
      setConfirmation("");
      onCompleted("La contraseña fue restablecida y las sesiones anteriores fueron revocadas.");
      onOpenChange(false);
    } catch {
      // Preserve both fields, including after 503, for an explicit retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Define una nueva contraseña global. Al guardarla se revocarán todas las sesiones actuales de la cuenta.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">{user.full_name || "Sin nombre"}</p>
              <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="platform-user-password" className="text-sm font-medium text-zinc-300">Nueva contraseña</label>
              <Input
                id="platform-user-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={mutation.isPending}
                aria-invalid={Boolean(passwordError)}
                className="border-white/10 bg-white/[0.03]"
              />
              {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="platform-user-password-confirmation" className="text-sm font-medium text-zinc-300">Confirmar contraseña</label>
              <Input
                id="platform-user-password-confirmation"
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                disabled={mutation.isPending}
                aria-invalid={Boolean(confirmationError)}
                className="border-white/10 bg-white/[0.03]"
              />
              {confirmationError && <p className="text-xs text-red-400">{confirmationError}</p>}
            </div>

            {errorMessage && (
              <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button>
              <Button type="submit" variant="destructive" disabled={!canSubmit}>
                {mutation.isPending ? (
                  <><LoaderCircle className="h-4 w-4 animate-spin" />Restableciendo...</>
                ) : "Restablecer contraseña"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
