"use client";

import {
  Archive,
  Eye,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { BusinessAction } from "@/components/businesses/business-action-dialog";
import {
  isBusinessCapabilities,
  type Business,
} from "@/types/business";

type BusinessesTableProps = {
  businesses: Business[];
  onView: (business: Business) => void;
  onEdit: (business: Business) => void;
  onAction: (business: Business, action: BusinessAction) => void;
};

function statusClassName(statusName: string) {
  if (statusName === "Activo") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (statusName === "Inactivo") return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  if (statusName === "Eliminado") return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";
  return "border-red-500/20 bg-red-500/10 text-red-300";
}

export default function BusinessesTable({
  businesses,
  onView,
  onEdit,
  onAction,
}: BusinessesTableProps) {
  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
        <p className="font-medium text-white">No hay negocios para mostrar</p>
        <p className="mt-2 text-sm text-zinc-500">Ajusta la búsqueda o el filtro de estado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <Table stickyHeader>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="px-5 text-zinc-500">Negocio</TableHead>
            <TableHead className="text-zinc-500">Estado</TableHead>
            <TableHead className="text-zinc-500">Moneda</TableHead>
            <TableHead className="text-zinc-500">Actualizado</TableHead>
            <TableHead className="px-5 text-right text-zinc-500">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((business) => {
            const capabilities = isBusinessCapabilities(
              business.capabilities
            )
              ? business.capabilities
              : null;
            const canEdit = capabilities?.can_edit === true;
            const canSuspend = capabilities?.can_suspend === true;
            const canReactivate = capabilities?.can_reactivate === true;
            const canArchive = capabilities?.can_archive === true;
            const hasAdministrativeAction =
              canEdit || canSuspend || canReactivate || canArchive;

            return (
              <TableRow key={business.public_id} className="border-white/10 hover:bg-white/[0.03]">
                <TableCell className="max-w-sm px-5">
                  <button type="button" onClick={() => onView(business)} className="block max-w-full text-left">
                    <span className="block truncate font-medium text-white hover:text-red-300">{business.business_name}</span>
                    <span className="mt-1 block truncate text-xs text-zinc-600">{business.description || "Sin descripción"}</span>
                  </button>
                </TableCell>
                <TableCell>
                  <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", statusClassName(business.status_name))}>
                    {business.status_name}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-400">{business.currency}</TableCell>
                <TableCell className="text-zinc-500">
                  {new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" }).format(new Date(business.updated_at))}
                </TableCell>
                <TableCell className="px-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:bg-white/10 hover:text-white" aria-label={`Acciones de ${business.business_name}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-white/10 bg-zinc-950 text-white">
                      <DropdownMenuItem onSelect={() => onView(business)} className="focus:bg-white/10 focus:text-white">
                        <Eye />Ver detalle
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem onSelect={() => onEdit(business)} className="focus:bg-white/10 focus:text-white">
                          <Pencil />Editar información
                        </DropdownMenuItem>
                      )}
                      {canSuspend && (
                        <DropdownMenuItem onSelect={() => onAction(business, "suspend")} className="focus:bg-white/10 focus:text-white">
                          <PowerOff />Suspender negocio
                        </DropdownMenuItem>
                      )}
                      {canReactivate && (
                        <DropdownMenuItem onSelect={() => onAction(business, "reactivate")} className="focus:bg-white/10 focus:text-white">
                          <Power />Reactivar negocio
                        </DropdownMenuItem>
                      )}
                      {canArchive && (
                        <DropdownMenuItem variant="destructive" onSelect={() => onAction(business, "archive")}>
                          <Archive />Archivar negocio
                        </DropdownMenuItem>
                      )}
                      {!hasAdministrativeAction && (
                        <DropdownMenuItem disabled>
                          {capabilities
                            ? "Sin acciones adicionales"
                            : "Capacidades no disponibles"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
