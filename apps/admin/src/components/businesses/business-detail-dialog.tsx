"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";

import { useBusiness } from "@/hooks/use-businesses";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Business } from "@/types/business";

type BusinessDetailDialogProps = {
  business: Business | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function BusinessDetailDialog({
  business,
  open,
  onOpenChange,
}: BusinessDetailDialogProps) {
  const query = useBusiness(business?.public_id, open);
  const current = query.data ?? business;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle del negocio</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Información actual registrada por PlayNow API.
          </DialogDescription>
        </DialogHeader>

        {query.isLoading && (
          <div className="flex min-h-40 items-center justify-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
          </div>
        )}

        {query.isError && (
          <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertCircle className="mb-2 h-5 w-5" />
            No fue posible actualizar el detalle.
            <Button type="button" variant="outline" size="sm" onClick={() => query.refetch()} className="ml-3 border-white/10 bg-transparent text-white">
              Reintentar
            </Button>
          </div>
        )}

        {current && !query.isLoading && !query.isError && (
          <dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-zinc-600">Nombre</dt>
              <dd className="mt-1 font-medium text-white">{current.business_name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-zinc-600">Descripción</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{current.description || "Sin descripción"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-600">Estado</dt>
              <dd className="mt-1 text-sm text-zinc-300">{current.status_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-600">Moneda</dt>
              <dd className="mt-1 text-sm text-zinc-300">{current.currency}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-600">Creado</dt>
              <dd className="mt-1 text-sm text-zinc-300">{formatDate(current.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-600">Actualizado</dt>
              <dd className="mt-1 text-sm text-zinc-300">{formatDate(current.updated_at)}</dd>
            </div>
          </dl>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 bg-transparent text-white">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
