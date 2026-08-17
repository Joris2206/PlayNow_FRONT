"use client";

import { Plus } from "lucide-react";
import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import { Button } from "@/components/ui/button";

type Props = { search: string; onSearchChange: (value: string) => void; pageSize: number; onPageSizeChange: (value: number) => void; onCreate: () => void; canCreate: boolean };

export default function PurchasesToolbar(props: Props) {
  return <CatalogListToolbar search={props.search} onSearchChange={props.onSearchChange} searchPlaceholder="Buscar compras..." searchLabel="Buscar compras" pageSize={props.pageSize} onPageSizeChange={props.onPageSizeChange} pageSizeLabel="Compras por página" actions={props.canCreate ? <Button type="button" onClick={props.onCreate} className="h-11 bg-red-500 text-white hover:bg-red-600"><Plus className="h-4 w-4" />Nueva compra</Button> : null} />;
}
