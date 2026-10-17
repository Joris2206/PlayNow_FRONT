"use client";

import { LoaderCircle } from "lucide-react";

import {
  useActivatePlatformUser,
  useDeactivatePlatformUser,
  useRevokePlatformUserSessions,
} from "@/hooks/use-platform-users";

import { getPlatformUserError } from "@/components/platform-users/platform-user-errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { PlatformUser } from "@/types/platform-user";

export type PlatformUserAction = "activate" | "deactivate" | "revoke-sessions";

type Props = {
  action: PlatformUserAction | null;
  user: PlatformUser | null;
  currentUserPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

const COPY = {
  activate: {
    title: "¿Activar usuario global?",
    description:
      "La cuenta podrá volver a autenticarse globalmente. Esto no activa memberships ni Employees inactivos.",
    button: "Activar usuario",
    pending: "Activando...",
    success: "El usuario global fue activado.",
  },
  deactivate: {
    title: "¿Desactivar usuario global?",
    description:
      "La cuenta dejará de autenticarse en toda la plataforma y sus sesiones serán revocadas. No se eliminan memberships, Employees ni historial.",
    button: "Desactivar usuario",
    pending: "Desactivando...",
    success: "El usuario global fue desactivado.",
  },
  "revoke-sessions": {
    title: "¿Revocar todas las sesiones?",
    description:
      "Todas las sesiones actuales de esta cuenta quedarán inválidas. Su contraseña y estado global no cambiarán.",
    button: "Revocar sesiones",
    pending: "Revocando...",
    success: "Las sesiones del usuario fueron revocadas.",
  },
} as const;

export default function PlatformUserActionDialog({
  action,
  user,
  currentUserPublicId,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const activate = useActivatePlatformUser();
  const deactivate = useDeactivatePlatformUser();
  const revokeSessions = useRevokePlatformUserSessions();
  const mutation =
    action === "activate"
      ? activate
      : action === "deactivate"
        ? deactivate
        : revokeSessions;
  const copy = action ? COPY[action] : null;
  const isSelf = user?.public_id === currentUserPublicId;
  const actionMatchesState =
    action === "activate" ? user?.is_active === false : action !== "deactivate" || user?.is_active === true;
  const selfProtected = isSelf && action !== "activate";
  const canSubmit = Boolean(
    action && user && actionMatchesState && !selfProtected && !mutation.isPending
  );
  const errorMessage = mutation.error
    ? getPlatformUserError(
        mutation.error,
        "No fue posible completar la acción global."
      )
    : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!canSubmit || !action || !user) return;

    try {
      await mutation.mutateAsync({
        publicId: user.public_id,
        isCurrentUser: user.public_id === currentUserPublicId,
      });
      onCompleted(COPY[action].success);
      onOpenChange(false);
    } catch {
      // Keep the confirmation open so a 503 or conflict can be retried deliberately.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>{copy?.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {copy?.description}
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium text-white">{user.full_name || "Sin nombre"}</p>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
        )}

        {selfProtected && (
          <div role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            El API no permite ejecutar esta acción sobre tu propia cuenta.
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
          {canSubmit && (
            <Button
              type="button"
              variant={action === "activate" ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={mutation.isPending}
              className={action === "activate" ? "bg-emerald-600 text-white hover:bg-emerald-700" : undefined}
            >
              {mutation.isPending ? (
                <><LoaderCircle className="h-4 w-4 animate-spin" />{copy?.pending}</>
              ) : copy?.button}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
