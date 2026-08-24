"use client";

import { Plus } from "lucide-react";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

type ExpensesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  canCreate: boolean;
  onCreate: () => void;
};

export default function ExpensesToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  canCreate,
  onCreate,
}: ExpensesToolbarProps) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar gastos..."
      searchLabel="Buscar gastos"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Gastos por página"
      actions={
        canCreate ? (
          <Button
            type="button"
            onClick={onCreate}
            className="h-11 bg-red-500 text-white hover:bg-red-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo gasto
          </Button>
        ) : null
      }
    />
  );
}
