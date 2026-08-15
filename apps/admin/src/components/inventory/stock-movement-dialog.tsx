"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  History,
  LoaderCircle,
} from "lucide-react";

import { useStockMovements } from "@/hooks/use-stock-movements";

import ListPagination from "@/components/shared/list-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Product } from "@/types/product";
import type {
  StockMovement,
  StockMovementType,
} from "@/types/stock-movement";

const HISTORY_PAGE_SIZE = 10;

const MOVEMENT_TYPE_LABELS: Record<
  StockMovementType,
  string
> = {
  entry: "Entrada",
  sale: "Venta",
  adjustment: "Ajuste",
};

type StockMovementDialogProps = {
  product: Product | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getVariantLabel(
  movement: StockMovement
) {
  if (
    movement.variant_type_name &&
    movement.variant_name
  ) {
    return `${movement.variant_type_name}: ${movement.variant_name}`;
  }

  return (
    movement.variant_name ??
    movement.variant_type_name ??
    "Sin variante"
  );
}

export default function StockMovementDialog({
  product,
  businessPublicId,
  open,
  onOpenChange,
}: StockMovementDialogProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open, product?.public_id]);

  const movementsQuery = useStockMovements({
    businessPublicId,
    productPublicId: product?.public_id,
    page,
    pageSize: HISTORY_PAGE_SIZE,
    ordering: "-created_at",
  });

  const data = movementsQuery.data;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Movimientos de {product?.title}
          </DialogTitle>

          <DialogDescription className="text-zinc-500">
            Historial de entradas, ventas y ajustes registrado por el sistema.
          </DialogDescription>
        </DialogHeader>

        {movementsQuery.isLoading && (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-6 w-6 animate-spin text-red-500" />
              <p className="text-sm text-zinc-500">
                Cargando movimientos...
              </p>
            </div>
          </div>
        )}

        {movementsQuery.isError && (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
              <p className="mt-3 text-sm text-zinc-400">
                No fue posible cargar los movimientos.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  movementsQuery.refetch()
                }
                className="mt-4 border-white/10 bg-transparent text-white hover:bg-white/5"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {movementsQuery.isSuccess && data && (
          <div className="space-y-4">
            {data.results.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                <History className="h-7 w-7 text-zinc-600" />
                <h3 className="mt-3 font-medium text-white">
                  Sin movimientos
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Este producto todavía no tiene movimientos de stock registrados.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="px-4 text-zinc-500">
                        Fecha y hora
                      </TableHead>
                      <TableHead className="px-4 text-zinc-500">
                        Tipo
                      </TableHead>
                      <TableHead className="px-4 text-right text-zinc-500">
                        Cantidad
                      </TableHead>
                      <TableHead className="px-4 text-zinc-500">
                        Variante
                      </TableHead>
                      <TableHead className="px-4 text-zinc-500">
                        Nota
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data.results.map((movement) => (
                      <TableRow
                        key={movement.public_id}
                        className="border-white/10 hover:bg-white/[0.025]"
                      >
                        <TableCell className="px-4 text-zinc-300">
                          {formatDateTime(
                            movement.created_at
                          )}
                        </TableCell>
                        <TableCell className="px-4 text-zinc-300">
                          {MOVEMENT_TYPE_LABELS[
                            movement.type
                          ]}
                        </TableCell>
                        <TableCell
                          className={`px-4 text-right font-semibold tabular-nums ${
                            movement.quantity > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {movement.quantity > 0
                            ? "+"
                            : ""}
                          {movement.quantity}
                        </TableCell>
                        <TableCell className="px-4 text-zinc-400">
                          {getVariantLabel(movement)}
                        </TableCell>
                        <TableCell className="max-w-xs px-4 text-zinc-400">
                          <span className="block truncate">
                            {movement.note || "Sin nota"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {data.count > 0 && (
              <ListPagination
                count={data.count}
                singularLabel="movimiento"
                pluralLabel="movimientos"
                currentPage={data.current_page}
                totalPages={data.total_pages}
                hasPrevious={Boolean(data.previous)}
                hasNext={Boolean(data.next)}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
