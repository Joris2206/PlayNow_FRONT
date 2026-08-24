"use client";

import { Plus } from "lucide-react";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

import type { EmployeeOrdering } from "@/types/employee";
import type { EntityStatus } from "@/types/entity-status";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  ordering: EmployeeOrdering;
  onOrderingChange: (value: EmployeeOrdering) => void;
  statusPublicId: string;
  onStatusChange: (value: string) => void;
  statuses: EntityStatus[];
  statusesLoading: boolean;
  canCreate: boolean;
  onCreate: () => void;
};

const ORDERING_OPTIONS: ReadonlyArray<[EmployeeOrdering, string]> = [
  ["full_name", "Nombre A–Z"],
  ["-full_name", "Nombre Z–A"],
  ["-created_at", "Más recientes"],
  ["created_at", "Más antiguos"],
  ["-updated_at", "Actualizados recientemente"],
  ["updated_at", "Actualizados anteriormente"],
];

export default function EmployeesToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  ordering,
  onOrderingChange,
  statusPublicId,
  onStatusChange,
  statuses,
  statusesLoading,
  canCreate,
  onCreate,
}: Props) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar empleados..."
      searchLabel="Buscar empleados"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Empleados por página"
      actions={
        <>
          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span className="whitespace-nowrap">Orden</span>
            <select
              value={ordering}
              onChange={(event) =>
                onOrderingChange(event.target.value as EmployeeOrdering)
              }
              aria-label="Ordenar empleados"
              className="min-w-32 bg-transparent font-medium text-white outline-none"
            >
              {ORDERING_OPTIONS.map(([value, label]) => (
                <option key={value} value={value} className="bg-zinc-950">
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span className="whitespace-nowrap">Estado</span>
            <select
              value={statusPublicId}
              onChange={(event) => onStatusChange(event.target.value)}
              disabled={statusesLoading}
              aria-label="Filtrar por estado"
              className="min-w-24 bg-transparent font-medium text-white outline-none"
            >
              <option value="" className="bg-zinc-950">Todos</option>
              {statuses.map((status) => (
                <option key={status.public_id} value={status.public_id} className="bg-zinc-950">
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          {canCreate && (
            <Button type="button" onClick={onCreate} className="h-11 bg-red-500 text-white hover:bg-red-600">
              <Plus className="h-4 w-4" />
              Nuevo empleado
            </Button>
          )}
        </>
      }
    />
  );
}
