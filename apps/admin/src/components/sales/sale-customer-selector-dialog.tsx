"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, LoaderCircle, Search } from "lucide-react";

import { useCustomers } from "@/hooks/use-customers";

import ListPagination from "@/components/shared/list-pagination";
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

import type { Customer } from "@/types/customer";

const CUSTOMER_PAGE_SIZE = 10;

type SaleCustomerSelectorDialogProps = {
  businessPublicId?: string;
  selectedCustomer: Customer | null;
  open: boolean;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customer: Customer) => void;
};

export default function SaleCustomerSelectorDialog({
  businessPublicId,
  selectedCustomer,
  open,
  disabled = false,
  onOpenChange,
  onSelect,
}: SaleCustomerSelectorDialogProps) {
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

  const customersQuery = useCustomers({
    businessPublicId: open ? businessPublicId : undefined,
    page,
    pageSize: CUSTOMER_PAGE_SIZE,
    search: search || undefined,
    ordering: "full_name",
  });
  const data = customersQuery.data;
  const initialLoading = customersQuery.isLoading && !data;

  function selectCustomer(customer: Customer) {
    onSelect(customer);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] overflow-hidden border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Seleccionar cliente</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Busca por nombre o teléfono y selecciona un cliente para esta venta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {selectedCustomer && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-red-400" />
              <span className="text-zinc-400">Cliente seleccionado:</span>
              <span className="min-w-0 truncate font-medium text-white">
                {selectedCustomer.full_name}
                {selectedCustomer.phone ? ` · ${selectedCustomer.phone}` : ""}
              </span>
            </div>
          )}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              aria-label="Buscar clientes para la venta"
              disabled={disabled}
              autoFocus
              className="h-11 border-white/10 bg-black/30 pl-10 pr-10 text-white"
            />
            {customersQuery.isFetching && (
              <span
                role="status"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="sr-only">Actualizando clientes...</span>
              </span>
            )}
          </div>
        </div>

        <div
          className="min-h-0 overflow-y-auto rounded-xl"
          aria-busy={customersQuery.isFetching}
        >
          {initialLoading && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <LoaderCircle className="h-5 w-5 animate-spin text-red-500" />
                Cargando clientes...
              </div>
            </div>
          )}

          {!initialLoading && customersQuery.isError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
              <p className="mt-3 text-sm text-red-300">
                No fue posible cargar los clientes.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => customersQuery.refetch()}
                className="mt-4 border-white/10 bg-transparent text-white"
              >
                Reintentar
              </Button>
            </div>
          )}

          {!initialLoading && !customersQuery.isError && data && (
            data.results.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/10 px-5 text-center text-sm text-zinc-500">
                {search
                  ? "No encontramos clientes que coincidan con la búsqueda."
                  : "No hay clientes disponibles."}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <Table className="min-w-[480px]">
                  <TableHeader className="bg-zinc-950">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="px-4 text-zinc-500">Cliente</TableHead>
                      <TableHead className="px-4 text-zinc-500">Teléfono</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.results.map((customer) => {
                      const selected =
                        selectedCustomer?.public_id === customer.public_id;
                      const selectable = !disabled && !selected;

                      return (
                        <TableRow
                          key={customer.public_id}
                          role={selectable ? "button" : undefined}
                          tabIndex={selectable ? 0 : undefined}
                          aria-label={
                            selectable
                              ? `Seleccionar a ${customer.full_name}`
                              : undefined
                          }
                          aria-current={selected ? "true" : undefined}
                          onClick={
                            selectable
                              ? () => selectCustomer(customer)
                              : undefined
                          }
                          onKeyDown={
                            selectable
                              ? (event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    selectCustomer(customer);
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
                              <span>{customer.full_name}</span>
                              {selected && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-300">
                                  <Check className="h-3.5 w-3.5" />
                                  Seleccionado
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-zinc-300">
                            {customer.phone || "Sin teléfono"}
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

        {!initialLoading && !customersQuery.isError && data && (
          <ListPagination
            count={data.count}
            singularLabel="cliente"
            pluralLabel="clientes"
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
            disabled={disabled}
            className="border-white/10 bg-transparent text-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
