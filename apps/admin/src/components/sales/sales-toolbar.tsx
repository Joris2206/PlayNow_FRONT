"use client";

import { Plus } from "lucide-react";
import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

type SalesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onCreate: () => void;
  canCreate: boolean;
};

export default function SalesToolbar(props: SalesToolbarProps) {
  return (
    <CatalogListToolbar
      search={props.search}
      onSearchChange={props.onSearchChange}
      searchPlaceholder="Buscar ventas..."
      searchLabel="Buscar ventas"
      pageSize={props.pageSize}
      onPageSizeChange={props.onPageSizeChange}
      pageSizeLabel="Ventas por página"
      actions={
        <Button
          type="button"
          onClick={props.onCreate}
          disabled={!props.canCreate}
          className="h-11 bg-red-500 text-white hover:bg-red-600"
        >
          <Plus className="h-4 w-4" />
          Nueva venta
        </Button>
      }
    />
  );
}
