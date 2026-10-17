"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";

import { usePlatformUser } from "@/hooks/use-platform-users";

import { getPlatformUserError } from "@/components/platform-users/platform-user-errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { PlatformUser } from "@/types/platform-user";

type Props = {
  user: PlatformUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PlatformUserDetailDialog({
  user,
  open,
  onOpenChange,
}: Props) {
  const query = usePlatformUser(user?.public_id, open);
  const current = query.data ?? user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del usuario global</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Identidad y estado globales. Los accesos a negocios se administran por separado.
          </DialogDescription>
        </DialogHeader>

        {query.isLoading && (
          <div className="flex min-h-40 items-center justify-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
          </div>
        )}

        {query.isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
            <p className="mt-3 text-sm text-red-300">
              {getPlatformUserError(
                query.error,
                "No fue posible cargar el usuario."
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => query.refetch()}
              className="mt-4 border-white/10 bg-transparent text-white"
            >
              Reintentar
            </Button>
          </div>
        )}

        {current && !query.isLoading && !query.isError && (
          <dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-500">Nombre</dt>
              <dd className="mt-1 text-sm font-medium text-white">
                {current.full_name || "Sin nombre"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Correo</dt>
              <dd className="mt-1 break-all text-sm text-zinc-300">
                {current.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Estado global</dt>
              <dd className="mt-1 text-sm text-zinc-300">
                {current.is_active ? "Activo" : "Inactivo"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Tipo de cuenta</dt>
              <dd className="mt-1 text-sm text-zinc-300">
                {current.is_superuser ? "Platform Admin" : "Usuario estándar"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Creado</dt>
              <dd className="mt-1 text-sm text-zinc-300">
                {formatDate(current.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Actualizado</dt>
              <dd className="mt-1 text-sm text-zinc-300">
                {formatDate(current.updated_at)}
              </dd>
            </div>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
