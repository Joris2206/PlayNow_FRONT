"use client";

import { History, LoaderCircle } from "lucide-react";

import {
  formatCashDate,
  formatCashMoney,
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
import type { CashRegister } from "@/types/cash";

type CashRegisterHistoryProps = {
  data?: PaginatedResponse<CashRegister>;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onPageChange: (value: number) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export default function CashRegisterHistory({
  data,
  pageSize,
  onPageSizeChange,
  onPageChange,
  isLoading,
  isError,
  onRetry,
}: CashRegisterHistoryProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Historial de cajas
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cierres autoritativos registrados por PlayNow API.
          </p>
        </div>

        <label className="flex h-10 w-fit items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-zinc-400">
          <span>Por página</span>
          <select
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value))
            }
            aria-label="Cajas cerradas por página"
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
            No fue posible cargar el historial de cajas.
          </p>
          <Button type="button" variant="outline" onClick={onRetry} className="mt-4 border-white/10 bg-transparent text-white">
            Reintentar
          </Button>
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <History className="h-7 w-7 text-zinc-600" />
          <h3 className="mt-4 font-medium text-white">
            Sin cierres anteriores
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Las cajas cerradas aparecerán aquí.
          </p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="overflow-x-auto">
              <Table className="min-w-[1180px]">
                <TableHeader className="border-b border-white/10 bg-white/[0.02]">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="px-5 text-zinc-500">Employee</TableHead>
                    <TableHead className="px-5 text-zinc-500">Apertura</TableHead>
                    <TableHead className="px-5 text-zinc-500">Cierre</TableHead>
                    <TableHead className="px-5 text-right text-zinc-500">Inicial</TableHead>
                    <TableHead className="px-5 text-right text-zinc-500">Esperado</TableHead>
                    <TableHead className="px-5 text-right text-zinc-500">Contado</TableHead>
                    <TableHead className="px-5 text-right text-zinc-500">Diferencia</TableHead>
                    <TableHead className="px-5 text-zinc-500">Responsables</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.results.map((register) => {
                    const differenceIsNegative = register.difference
                      ?.trim()
                      .startsWith("-");
                    const differenceIsZero =
                      register.difference === "0.00";

                    return (
                      <TableRow key={register.public_id} className="border-white/10 hover:bg-white/[0.025]">
                        <TableCell className="px-5 py-4 font-medium text-white">
                          {register.employee_name ?? "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-zinc-400">
                          {formatCashDate(register.open_time)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-zinc-400">
                          {formatCashDate(register.close_time)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right text-zinc-300">
                          {formatCashMoney(register.opening_balance, register.business_currency)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right text-zinc-300">
                          {formatCashMoney(register.expected_closing_balance, register.business_currency)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right text-zinc-300">
                          {formatCashMoney(register.closing_balance, register.business_currency)}
                        </TableCell>
                        <TableCell className={`px-5 py-4 text-right font-semibold ${differenceIsZero ? "text-zinc-300" : differenceIsNegative ? "text-red-400" : "text-emerald-400"}`}>
                          {formatCashMoney(register.difference, register.business_currency)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-xs text-zinc-400">
                          <span className="block">Abrió: {register.opened_by_name ?? "—"}</span>
                          <span className="mt-1 block">Cerró: {register.closed_by_name ?? "—"}</span>
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
            singularLabel="caja cerrada"
            pluralLabel="cajas cerradas"
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
