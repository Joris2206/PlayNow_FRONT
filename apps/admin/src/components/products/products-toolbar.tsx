"use client";

import Link from "next/link";
import {
  Plus,
  Tags,
} from "lucide-react";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

type ProductsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onCreate: () => void;
  canCreate: boolean;
};

export default function ProductsToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  onCreate,
  canCreate,
}: ProductsToolbarProps) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar productos..."
      searchLabel="Buscar productos"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Productos por página"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            asChild
            className="h-11 border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            <Link href="/categories">
              <Tags className="h-4 w-4" />
              Administrar categorías
            </Link>
          </Button>

          <Button
            type="button"
            onClick={onCreate}
            disabled={!canCreate}
            className="h-11 bg-red-500 text-white hover:bg-red-600"
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </>
      }
    />
  );
}
