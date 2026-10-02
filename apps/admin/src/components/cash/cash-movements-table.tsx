"use client";

import { ArrowLeftRight, LoaderCircle } from "lucide-react";

import {
  CASH_MOVEMENT_TYPE_LABELS,
  formatCashDate,
  formatSignedCashMoney,
} from "@/components/cash/cash-format";
import ListPagination from "@/components/shared/list-pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PaginatedResponse } from "@/types/api";
import type { CashMovement } from "@/types/cash";

type CashMovementsTableProps = {
  data?: PaginatedResponse<CashMovement>;
  currency: string;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onPageChange: (value: number) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export default function CashMovementsTable({
  data,
  currency,
  pageSize,
  onPageSizeChange,
  onPageChange,
  isLoading,
  isError,
  onRetry,
}: CashMovementsTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Movimientos manuales
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Movimientos registrados directamente contra esta caja.
          </p>
        </div>

        <label className="flex h-10 w-fit items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-zinc-400">
          <span>Por página</span>
          <select
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value))
            }
            aria-label="Movimientos por página"
            className="bg-transparent font-medium text-white outline-none"
          >
            {[10, 20, 50].map((value) => (
              <option key={value} value={value} className="bg-zinc-950">
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <LoaderCircle className="h-6 w-6 animate-spin text-red-500" />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-300">
            No fue posible cargar los movimientos de la caja.
          </p>
          <Button type="button" variant="outline" onClick={onRetry} className="mt-4 border-white/10 bg-transparent text-white">
            Reintentar
          </Button>
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <ArrowLeftRight className="h-7 w-7 text-zinc-600" />
          <h3 className="mt-4 font-medium text-white">
            Sin movimientos manuales
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Esta caja todavía no tiene depósitos, retiros u otros movimientos manuales.
          </p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="overflow-x-auto">
              <Table stickyHeader className="min-w-[900px]">
                <TableHeader className="border-b border-white/10 bg-white/[0.02]">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="px-5 text-zinc-500">Fecha</TableHead>
                    <TableHead className="px-5 text-zinc-500">Tipo</TableHead>
                    <TableHead className="px-5 text-zinc-500">Empleado</TableHead>
                    <TableHead className="px-5 text-zinc-500">Método</TableHead>
                    <TableHead className="px-5 text-zinc-500">Nota</TableHead>
                    <TableHead className="px-5 text-right text-zinc-500">Importe</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.results.map((movement) => {
                    const isOutgoing = movement.signed_amount
                      .trim()
                      .startsWith("-");

                    return (
                      <TableRow key={movement.public_id} className="border-white/10 hover:bg-white/[0.025]">
                        <TableCell className="px-5 py-4 text-zinc-400">
                          {formatCashDate(movement.created_at)}
                        </TableCell>
                        <TableCell className="px-5 py-4 font-medium text-white">
                          {CASH_MOVEMENT_TYPE_LABELS[movement.movement_type]}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-zinc-300">
                          {movement.employee_name ?? "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-zinc-300">
                          {movement.payment_method_name ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-72 truncate px-5 py-4 text-zinc-400" title={movement.note || undefined}>
                          {movement.note || "—"}
                        </TableCell>
                        <TableCell className={`px-5 py-4 text-right font-semibold ${isOutgoing ? "text-amber-400" : "text-emerald-400"}`}>
                          {formatSignedCashMoney(movement.signed_amount, currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <ListPagination
            count={data.count}
            singularLabel="movimiento"
            pluralLabel="movimientos"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={onPageChange}
          />
        </>
      )}
    </section>
  );
}
