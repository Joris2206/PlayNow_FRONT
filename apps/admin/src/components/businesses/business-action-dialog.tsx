"use client";

import { LoaderCircle } from "lucide-react";

import {
  useArchiveBusiness,
  useBusiness,
  useReactivateBusiness,
  useSuspendBusiness,
} from "@/hooks/use-businesses";
import { getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  isBusinessCapabilities,
  type Business,
  type BusinessCapabilities,
} from "@/types/business";

export type BusinessAction = "suspend" | "reactivate" | "archive";

type BusinessActionDialogProps = {
  action: BusinessAction | null;
  business: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

const COPY = {
  suspend: {
    title: "¿Suspender negocio?",
    description:
      "El negocio dejará de estar operativo y sus operaciones internas quedarán bloqueadas hasta que un propietario o administrador de plataforma lo reactive.",
    button: "Suspender negocio",
    pending: "Suspendiendo...",
    success: "El negocio fue suspendido.",
  },
  reactivate: {
    title: "¿Reactivar negocio?",
    description:
      "El negocio volverá a estar disponible como contexto operativo para sus memberships activas.",
    button: "Reactivar negocio",
    pending: "Reactivando...",
    success: "El negocio fue reactivado.",
  },
  archive: {
    title: "¿Archivar negocio?",
    description:
      "El negocio cambiará al estado Eliminado. Se conservarán su historial y relaciones, pero no podrá restaurarse con la acción de reactivación.",
    button: "Archivar negocio",
    pending: "Archivando...",
    success: "El negocio fue archivado.",
  },
} as const;

function hasActionCapability(
  capabilities: BusinessCapabilities,
  action: BusinessAction
) {
  if (action === "suspend") return capabilities.can_suspend;
  if (action === "reactivate") return capabilities.can_reactivate;
  return capabilities.can_archive;
}

export default function BusinessActionDialog({
  action,
  business,
  open,
  onOpenChange,
  onCompleted,
}: BusinessActionDialogProps) {
  const suspendBusiness = useSuspendBusiness();
  const reactivateBusiness = useReactivateBusiness();
  const archiveBusiness = useArchiveBusiness();
  const businessQuery = useBusiness(business?.public_id, open);
  const displayedBusiness = businessQuery.data ?? business;
  const currentBusiness =
    businessQuery.isSuccess &&
    !businessQuery.isFetching &&
    businessQuery.data.public_id === business?.public_id
      ? businessQuery.data
      : null;
  const capabilities =
    currentBusiness &&
    isBusinessCapabilities(currentBusiness.capabilities)
      ? currentBusiness.capabilities
      : null;
  const mutation =
    action === "suspend"
      ? suspendBusiness
      : action === "reactivate"
        ? reactivateBusiness
        : archiveBusiness;
  const copy = action ? COPY[action] : null;
  const capabilitiesMayBeStale =
    mutation.error instanceof HttpError &&
    [403, 404, 409].includes(mutation.error.status);
  const canPerformAction = Boolean(
    action &&
      currentBusiness &&
      capabilities &&
      hasActionCapability(capabilities, action) &&
      !capabilitiesMayBeStale
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    if (!action || !currentBusiness || !canPerformAction || mutation.isPending) {
      return;
    }

    try {
      await mutation.mutateAsync(currentBusiness.public_id);
      onCompleted(COPY[action].success);
      onOpenChange(false);
    } catch {
      // React Query exposes the backend error below and permits manual retry.
    }
  }

  const errorMessage = mutation.error
    ? getApiErrorMessage(mutation.error, "No fue posible completar la acción.")
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>{copy?.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {copy?.description}
          </DialogDescription>
        </DialogHeader>
        {displayedBusiness && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-medium text-white">{displayedBusiness.business_name}</p>
            <p className="mt-1 text-sm text-zinc-500">Estado actual: {displayedBusiness.status_name}</p>
          </div>
        )}
        {(businessQuery.isPending || businessQuery.isFetching) &&
          !mutation.isPending && (
            <div role="status" className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              Verificando las capacidades actuales del negocio...
            </div>
          )}
        {businessQuery.isError && (
          <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            No fue posible verificar las capacidades del negocio. Cierra el diálogo e inténtalo nuevamente.
          </div>
        )}
        {businessQuery.isSuccess &&
          !businessQuery.isFetching &&
          !capabilities && (
          <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            La respuesta del negocio está incompleta y no permite ejecutar esta acción de forma segura.
          </div>
          )}
        {action && capabilities && !canPerformAction && !mutation.isPending && (
          <div role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Esta acción ya no está disponible. Las capacidades del negocio fueron actualizadas.
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
          {canPerformAction && (
            <Button type="button" variant={action === "archive" ? "destructive" : "default"} onClick={handleConfirm} disabled={mutation.isPending} className={action === "reactivate" ? "bg-emerald-600 text-white hover:bg-emerald-700" : undefined}>
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
