"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, LoaderCircle, Search } from "lucide-react";

import { useEmployees } from "@/hooks/use-employees";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { findStatusByName } from "@/lib/catalog-status";

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

import type { EmployeeOption } from "@/types/employee";

const PAGE_SIZE = 10;

type Props = {
  id: string;
  label: string;
  businessPublicId?: string;
  value: string;
  onChange: (publicId: string, employee: EmployeeOption | null) => void;
  selectedEmployee?: EmployeeOption | null;
  activeOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
};

export default function CommissionEmployeeSelect({
  id,
  label,
  businessPublicId,
  value,
  onChange,
  selectedEmployee = null,
  activeOnly = false,
  disabled = false,
  required = false,
  invalid = false,
}: Props) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const statusesQuery = useEntityStatuses(
    Boolean(selectorOpen && businessPublicId && activeOnly)
  );
  const activeStatus = activeOnly
    ? findStatusByName(statusesQuery.data?.results ?? [], "Activo")
    : undefined;
  const unavailableActiveStatus = Boolean(
    activeOnly && statusesQuery.isSuccess && !activeStatus
  );

  useEffect(() => {
    setSelectorOpen(false);
  }, [businessPublicId]);

  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearch("");
  }, [selectorOpen, businessPublicId, activeOnly]);

  useEffect(() => {
    if (!selectorOpen) return;

    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [selectorOpen, searchInput]);

  const employeesQuery = useEmployees({
    businessPublicId:
      selectorOpen && businessPublicId && (!activeOnly || activeStatus)
        ? businessPublicId
        : undefined,
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    ordering: "full_name",
    statusPublicId: activeStatus?.public_id,
  });
  const data = employeesQuery.data;
  const initialLoading =
    (employeesQuery.isLoading && !data) ||
    (activeOnly && statusesQuery.isLoading);

  function selectEmployee(employee: EmployeeOption) {
    onChange(employee.public_id, employee);
    setSelectorOpen(false);
  }

  return (
    <div className="space-y-2">
      <h3 id={`${id}-label`} className="text-sm font-medium text-zinc-300">
        {label}
      </h3>
      <div className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
        invalid
          ? "border-red-500/50 bg-red-500/5"
          : value
            ? "border-white/10 bg-white/[0.02]"
            : "border-dashed border-white/10 bg-white/[0.02]"
      }`}>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {value ? "Empleado seleccionado" : "Sin empleado seleccionado"}
          </p>
          {value && (
            <>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {selectedEmployee?.full_name ?? "Empleado seleccionado"}
              </p>
              {selectedEmployee?.position && (
                <p className="mt-1 truncate text-xs text-zinc-400">
                  {selectedEmployee.position}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="inverseOutline"
            size={value ? "sm" : "default"}
            onClick={() => setSelectorOpen(true)}
            disabled={disabled || !businessPublicId}
            aria-label={`${value ? "Cambiar" : "Seleccionar"} empleado para ${label.toLocaleLowerCase()}`}
            aria-invalid={invalid}
          >
            {value ? "Cambiar" : "Seleccionar empleado"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("", null)}
              disabled={disabled}
              aria-label={`Quitar ${selectedEmployee?.full_name ?? "empleado seleccionado"}`}
              className="text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              Quitar
            </Button>
          )}
        </div>
      </div>
      {required && invalid && (
        <span className="sr-only" role="alert">Selecciona un empleado.</span>
      )}

      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-h-[90vh] grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] overflow-hidden border-white/10 bg-zinc-950 text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Seleccionar empleado</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Busca y selecciona un empleado para {label.toLocaleLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedEmployee && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-red-400" />
                <span className="text-zinc-400">Empleado seleccionado:</span>
                <span className="min-w-0 truncate font-medium text-white">
                  {selectedEmployee.full_name}
                  {selectedEmployee.position ? ` · ${selectedEmployee.position}` : ""}
                </span>
              </div>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar empleados..."
                aria-label="Buscar empleados para comisiones"
                disabled={disabled || !businessPublicId || (activeOnly && !activeStatus)}
                autoFocus
                className="h-11 border-white/10 bg-black/30 pl-10 pr-10 text-white"
              />
              {employeesQuery.isFetching && (
                <span role="status" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span className="sr-only">Actualizando empleados...</span>
                </span>
              )}
            </div>

            {statusesQuery.isError && (
              <p role="alert" className="text-sm text-red-300">
                No fue posible encontrar el estado Activo de los empleados.
              </p>
            )}
            {unavailableActiveStatus && (
              <p role="alert" className="text-sm text-amber-300">
                No está disponible el estado Activo necesario para consultar empleados.
              </p>
            )}
          </div>

          <div className="min-h-0 overflow-y-auto rounded-xl" aria-busy={employeesQuery.isFetching}>
            {initialLoading && (
              <div className="flex min-h-56 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <LoaderCircle className="h-5 w-5 animate-spin text-red-500" />
                  Cargando empleados...
                </div>
              </div>
            )}

            {!initialLoading && employeesQuery.isError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
                <p className="mt-3 text-sm text-red-300">No fue posible cargar los empleados.</p>
                <Button type="button" variant="outline" onClick={() => employeesQuery.refetch()} className="mt-4 border-white/10 bg-transparent text-white">
                  Reintentar
                </Button>
              </div>
            )}

            {!initialLoading && !employeesQuery.isError && data && (
              data.results.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-white/10 px-5 text-center text-sm text-zinc-500">
                  {search
                    ? "No encontramos empleados que coincidan con la búsqueda."
                    : activeOnly
                      ? "No hay empleados activos disponibles."
                      : "No hay empleados disponibles."}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <Table className="min-w-[480px]">
                    <TableHeader className="bg-zinc-950">
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="px-4 text-zinc-500">Empleado</TableHead>
                        <TableHead className="px-4 text-zinc-500">Puesto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.results.map((employee) => {
                        const selected = value === employee.public_id;
                        const selectable = !disabled && !selected;

                        return (
                          <TableRow
                            key={employee.public_id}
                            role={selectable ? "button" : undefined}
                            tabIndex={selectable ? 0 : undefined}
                            aria-label={selectable ? `Seleccionar a ${employee.full_name}` : undefined}
                            aria-current={selected ? "true" : undefined}
                            onClick={selectable ? () => selectEmployee(employee) : undefined}
                            onKeyDown={selectable ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                selectEmployee(employee);
                              }
                            } : undefined}
                            className={selectable
                              ? "cursor-pointer border-white/10 hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500/70"
                              : "border-white/10"}
                          >
                            <TableCell className="max-w-sm whitespace-normal px-4 font-medium text-white">
                              <div className="flex items-center justify-between gap-3">
                                <span>{employee.full_name}</span>
                                {selected && (
                                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-300">
                                    <Check className="h-3.5 w-3.5" />
                                    Seleccionado
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-normal px-4 text-zinc-300">
                              {employee.position || "Sin puesto"}
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

          {!initialLoading && !employeesQuery.isError && data && (
            <ListPagination
              count={data.count}
              singularLabel="empleado"
              pluralLabel="empleados"
              currentPage={data.current_page}
              totalPages={Math.max(1, data.total_pages)}
              hasPrevious={Boolean(data.previous)}
              hasNext={Boolean(data.next)}
              onPageChange={setPage}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectorOpen(false)} disabled={disabled} className="border-white/10 bg-transparent text-white">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
