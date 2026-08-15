"use client";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";

export type InventoryOrdering =
  | "title"
  | "-title";

type InventoryToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  ordering: InventoryOrdering;
  onOrderingChange: (
    value: InventoryOrdering
  ) => void;
};

export default function InventoryToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  ordering,
  onOrderingChange,
}: InventoryToolbarProps) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar inventario..."
      searchLabel="Buscar productos en inventario"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Productos por página"
      actions={
        <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
          <span className="whitespace-nowrap">
            Orden
          </span>

          <select
            value={ordering}
            onChange={(event) =>
              onOrderingChange(
                event.target.value as InventoryOrdering
              )
            }
            aria-label="Ordenar inventario"
            className="bg-transparent font-medium text-white outline-none"
          >
            <option
              value="title"
              className="bg-zinc-950"
            >
              Nombre A-Z
            </option>

            <option
              value="-title"
              className="bg-zinc-950"
            >
              Nombre Z-A
            </option>
          </select>
        </label>
      }
    />
  );
}
