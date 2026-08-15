"use client";

import { Plus } from "lucide-react";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

type CategoriesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onCreate: () => void;
  canCreate: boolean;
};

export default function CategoriesToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  onCreate,
  canCreate,
}: CategoriesToolbarProps) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar categorías..."
      searchLabel="Buscar categorías"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Categorías por página"
      actions={
        <Button
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          className="h-11 shrink-0 bg-red-500 text-white hover:bg-red-600"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      }
    />
  );
}
