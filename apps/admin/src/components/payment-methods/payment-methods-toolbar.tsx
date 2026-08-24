"use client";

import { Plus } from "lucide-react";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

import type { EntityStatus } from "@/types/entity-status";

type PaymentMethodsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  statusPublicId: string;
  onStatusChange: (value: string) => void;
  statuses: EntityStatus[];
  statusesLoading: boolean;
  canCreate: boolean;
  onCreate: () => void;
};

export default function PaymentMethodsToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  statusPublicId,
  onStatusChange,
  statuses,
  statusesLoading,
  canCreate,
  onCreate,
}: PaymentMethodsToolbarProps) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar métodos de pago..."
      searchLabel="Buscar métodos de pago"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Métodos de pago por página"
      actions={
        <>
          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span className="whitespace-nowrap">Estado</span>

            <select
              value={statusPublicId}
              onChange={(event) =>
                onStatusChange(event.target.value)
              }
              disabled={statusesLoading}
              aria-label="Filtrar por estado"
              className="min-w-24 bg-transparent font-medium text-white outline-none"
            >
              <option value="" className="bg-zinc-950">
                Todos
              </option>

              {statuses.map((status) => (
                <option
                  key={status.public_id}
                  value={status.public_id}
                  className="bg-zinc-950"
                >
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          {canCreate && (
            <Button
              type="button"
              onClick={onCreate}
              className="h-11 bg-red-500 text-white hover:bg-red-600"
            >
              <Plus className="h-4 w-4" />
              Nuevo método
            </Button>
          )}
        </>
      }
    />
  );
}
