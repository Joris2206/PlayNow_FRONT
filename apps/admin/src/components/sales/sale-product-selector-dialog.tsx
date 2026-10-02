"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, LoaderCircle, Search } from "lucide-react";

import { useProducts } from "@/hooks/use-products";

import ListPagination from "@/components/shared/list-pagination";
import { formatSaleMoney } from "@/components/sales/sales-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Product } from "@/types/product";

const PRODUCT_PAGE_SIZE = 10;

type SaleProductSelectorDialogProps = {
  businessPublicId?: string;
  activeStatusPublicId?: string;
  selectedProductIds: ReadonlySet<string>;
  open: boolean;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
};

export default function SaleProductSelectorDialog({
  businessPublicId,
  activeStatusPublicId,
  selectedProductIds,
  open,
  disabled = false,
  onOpenChange,
  onAdd,
}: SaleProductSelectorDialogProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearch("");
  }, [open, businessPublicId]);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [open, searchInput]);

  const productsQuery = useProducts({
    businessPublicId:
      open && activeStatusPublicId ? businessPublicId : undefined,
    page,
    pageSize: PRODUCT_PAGE_SIZE,
    search: search || undefined,
    statusPublicId: activeStatusPublicId,
  });
  const data = productsQuery.data;
  const initialLoading = productsQuery.isLoading && !data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] overflow-hidden border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Agregar productos</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Busca en el catálogo activo y agrega los productos de esta venta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos para la venta"
              disabled={disabled}
              autoFocus
              className="h-11 border-white/10 bg-black/30 pl-10 pr-10 text-white"
            />
            {productsQuery.isFetching && (
              <span
                role="status"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="sr-only">Actualizando productos...</span>
              </span>
            )}
          </div>

          {!activeStatusPublicId && (
            <p role="alert" className="text-sm text-amber-300">
              No existe el estado Activo necesario para consultar productos.
            </p>
          )}
        </div>

        <div
          className="min-h-0 overflow-y-auto rounded-xl"
          aria-busy={productsQuery.isFetching}
        >
          {initialLoading && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <LoaderCircle className="h-5 w-5 animate-spin text-red-500" />
                Cargando productos...
              </div>
            </div>
          )}

          {!initialLoading && productsQuery.isError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
              <p className="mt-3 text-sm text-red-300">
                No fue posible cargar los productos.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => productsQuery.refetch()}
                className="mt-4 border-white/10 bg-transparent text-white"
              >
                Reintentar
              </Button>
            </div>
          )}

          {!initialLoading && !productsQuery.isError && data && (
            data.results.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/10 px-5 text-center text-sm text-zinc-500">
                {search
                  ? "No hay productos que coincidan con la búsqueda."
                  : "No hay productos activos disponibles."}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-zinc-950">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="px-4 text-zinc-500">Producto</TableHead>
                      <TableHead className="px-4 text-right text-zinc-500">Precio</TableHead>
                      <TableHead className="px-4 text-right text-zinc-500">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.results.map((product) => {
                      const added = selectedProductIds.has(product.public_id);
                      const soldOut = product.stock <= 0;
                      const selectable = !disabled && !soldOut && !added;

                      return (
                        <TableRow
                          key={product.public_id}
                          role={selectable ? "button" : undefined}
                          tabIndex={selectable ? 0 : undefined}
                          aria-label={
                            selectable
                              ? `Agregar ${product.title} a la venta`
                              : undefined
                          }
                          onClick={
                            selectable ? () => onAdd(product) : undefined
                          }
                          onKeyDown={
                            selectable
                              ? (event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    onAdd(product);
                                  }
                                }
                              : undefined
                          }
                          className={
                            selectable
                              ? "cursor-pointer border-white/10 hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500/70"
                              : "border-white/10"
                          }
                        >
                          <TableCell className="max-w-sm whitespace-normal px-4 font-medium text-white">
                            <div className="flex items-center justify-between gap-3">
                              <span>{product.title}</span>
                              {added && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-300">
                                  <Check className="h-3.5 w-3.5" />
                                  Agregado
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-right text-zinc-300">
                            {formatSaleMoney(product.base_price)}
                          </TableCell>
                          <TableCell className="px-4 text-right text-zinc-300">
                            <div className="flex items-center justify-end gap-3">
                              <span>{product.stock}</span>
                              {soldOut && (
                                <span className="text-xs font-medium text-amber-300">
                                  Agotado
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )
          )}
        </div>

        {!initialLoading && !productsQuery.isError && data && (
          <ListPagination
            count={data.count}
            singularLabel="producto"
            pluralLabel="productos"
            currentPage={data.current_page}
            totalPages={Math.max(1, data.total_pages)}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 bg-transparent text-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
