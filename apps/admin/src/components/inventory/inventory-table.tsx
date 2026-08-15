"use client";

import {
  History,
  PackageSearch,
} from "lucide-react";

import { getCatalogStatusClassName } from "@/lib/catalog-status";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Product } from "@/types/product";

type InventoryTableProps = {
  products: Product[];
  onViewMovements: (product: Product) => void;
};

export default function InventoryTable({
  products,
  onViewMovements,
}: InventoryTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <PackageSearch className="h-6 w-6" />
        </div>

        <h3 className="font-medium text-white">
          No hay productos en inventario
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos productos que coincidan con la búsqueda actual.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <Table className="min-w-[760px]">
        <TableHeader className="border-b border-white/10 bg-white/[0.02]">
          <TableRow className="border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500 hover:bg-transparent">
            <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
              Producto
            </TableHead>

            <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
              Categoría
            </TableHead>

            <TableHead className="h-auto px-5 py-4 text-right font-medium text-zinc-500">
              Stock actual
            </TableHead>

            <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
              Estado
            </TableHead>

            <TableHead className="h-auto px-5 py-4 text-right font-medium text-zinc-500">
              Historial
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.public_id}
              className="border-white/10 hover:bg-white/[0.025]"
            >
              <TableCell className="px-5 py-4 font-medium text-white">
                {product.title}
              </TableCell>

              <TableCell className="px-5 py-4 text-zinc-400">
                {product.category_name ?? "Sin categoría"}
              </TableCell>

              <TableCell className="px-5 py-4 text-right text-base font-semibold tabular-nums text-white">
                {product.stock}
              </TableCell>

              <TableCell className="px-5 py-4">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                    getCatalogStatusClassName(
                      product.status_name
                    )
                  )}
                >
                  {product.status_name}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onViewMovements(product)
                  }
                  className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  <History className="h-4 w-4" />
                  Ver movimientos
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
