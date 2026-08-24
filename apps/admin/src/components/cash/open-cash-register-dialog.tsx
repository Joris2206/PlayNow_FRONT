"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useEmployees } from "@/hooks/use-employees";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { useOpenCashRegister } from "@/hooks/use-cash-registers";
import { findStatusByName } from "@/lib/catalog-status";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";

import {
  CASH_MONEY_INPUT_PATTERN,
  getCashErrorMessage,
} from "@/components/cash/cash-format";
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

import type { EmployeeOption } from "@/types/employee";

const EMPLOYEE_PAGE_SIZE = 20;

type OpenCashRegisterDialogProps = {
  businessPublicId?: string;
  initialEmployeePublicId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function OpenCashRegisterDialog({
  businessPublicId,
  initialEmployeePublicId,
  open,
  onOpenChange,
}: OpenCashRegisterDialogProps) {
  const [employeePage, setEmployeePage] = useState(1);
  const [employeePublicId, setEmployeePublicId] =
    useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);
  const [openingBalance, setOpeningBalance] =
    useState("");
  const [openingNotes, setOpeningNotes] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] =
    useState(false);
  const openCashRegister = useOpenCashRegister();
  const resetOpenCashRegister = openCashRegister.reset;
  const statusesQuery = useEntityStatuses(open);
  const activeStatus = findStatusByName(
    statusesQuery.data?.results ?? [],
    "Activo"
  );
  const employeesQuery = useEmployees({
    businessPublicId:
      open && activeStatus ? businessPublicId : undefined,
    page: employeePage,
    pageSize: EMPLOYEE_PAGE_SIZE,
    ordering: "full_name",
    statusPublicId: activeStatus?.public_id,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmployeePage(1);
    setEmployeePublicId(initialEmployeePublicId ?? "");
    setSelectedEmployee(null);
    setOpeningBalance("");
    setOpeningNotes("");
    setAttemptedSubmit(false);
    resetOpenCashRegister();
  }, [
    businessPublicId,
    initialEmployeePublicId,
    open,
    resetOpenCashRegister,
  ]);

  const openingBalanceMinor =
    toMoneyMinorUnits(openingBalance);
  const validOpeningBalance =
    openingBalanceMinor !== null &&
    openingBalanceMinor >= 0n;
  const canSubmit = Boolean(
    businessPublicId &&
      employeePublicId &&
      validOpeningBalance
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && openCashRegister.isPending) {
      return;
    }

    if (!nextOpen) {
      resetOpenCashRegister();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (
      !canSubmit ||
      !businessPublicId ||
      openCashRegister.isPending
    ) {
      return;
    }

    try {
      await openCashRegister.mutateAsync({
        business_public_id: businessPublicId,
        employee_public_id: employeePublicId,
        opening_balance: openingBalance,
        ...(openingNotes.trim()
          ? { opening_notes: openingNotes.trim() }
          : {}),
      });

      onOpenChange(false);
    } catch {
      // Keep the dialog open with the backend validation error.
    }
  }

  const errorMessage = openCashRegister.error
    ? getCashErrorMessage(
        openCashRegister.error,
        "No fue posible abrir la caja."
      )
    : null;

  const employees = useMemo(() => {
    const listed = employeesQuery.data?.results ?? [];

    return selectedEmployee &&
      !listed.some(
        (employee) =>
          employee.public_id === selectedEmployee.public_id
      )
      ? [selectedEmployee, ...listed]
      : listed;
  }, [employeesQuery.data, selectedEmployee]);

  const selectedEmployeeIsListed = employees.some(
    (employee) => employee.public_id === employeePublicId
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Selecciona al Employee responsable e indica el efectivo inicial contado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="cash-open-employee" className="text-sm font-medium text-zinc-300">
              Employee
            </label>
            <select
              id="cash-open-employee"
              value={employeePublicId}
              onChange={(event) => {
                const publicId = event.target.value;
                setEmployeePublicId(publicId);
                setSelectedEmployee(
                  employees.find(
                    (employee) => employee.public_id === publicId
                  ) ?? null
                );
              }}
              disabled={employeesQuery.isLoading || openCashRegister.isPending}
              aria-invalid={attemptedSubmit && !employeePublicId}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"
            >
              <option value="">
                {employeesQuery.isLoading
                  ? "Cargando Employees..."
                  : "Selecciona un Employee"}
              </option>
              {employeePublicId && !selectedEmployeeIsListed && (
                <option value={employeePublicId}>
                  Employee asociado a tu membresía
                </option>
              )}
              {employees.map((employee) => (
                <option key={employee.public_id} value={employee.public_id}>
                  {employee.full_name} · {employee.position}
                </option>
              ))}
            </select>
            {attemptedSubmit && !employeePublicId && (
              <p className="text-xs text-red-400">
                Selecciona el Employee responsable de la caja.
              </p>
            )}
            {employeesQuery.isError && (
              <div className="flex items-center justify-between gap-3 text-sm text-red-300">
                <span>No fue posible cargar los Employees.</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => employeesQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            )}
            {statusesQuery.isError && (
              <p role="alert" className="text-sm text-red-300">
                No fue posible resolver el estado Activo de los Employees.
              </p>
            )}
            {statusesQuery.isSuccess && !activeStatus && (
              <p role="alert" className="text-sm text-amber-300">
                No existe el estado Activo necesario para consultar empleados.
              </p>
            )}
            {employeesQuery.data && employeesQuery.data.total_pages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!employeesQuery.data.previous || openCashRegister.isPending}
                  onClick={() => setEmployeePage((current) => Math.max(1, current - 1))}
                  className="border-white/10 bg-transparent text-zinc-300"
                >
                  Anterior
                </Button>
                <span className="text-xs text-zinc-500">
                  Página {employeesQuery.data.current_page} de {employeesQuery.data.total_pages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!employeesQuery.data.next || openCashRegister.isPending}
                  onClick={() => setEmployeePage((current) => current + 1)}
                  className="border-white/10 bg-transparent text-zinc-300"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cash-opening-balance" className="text-sm font-medium text-zinc-300">
              Saldo inicial
            </label>
            <Input
              id="cash-opening-balance"
              type="text"
              inputMode="decimal"
              value={openingBalance}
              onChange={(event) => {
                if (CASH_MONEY_INPUT_PATTERN.test(event.target.value)) {
                  setOpeningBalance(event.target.value);
                }
              }}
              disabled={openCashRegister.isPending}
              aria-invalid={attemptedSubmit && !validOpeningBalance}
              placeholder="0.00"
              className="h-11 border-white/10 bg-black/30 text-white"
            />
            {attemptedSubmit && !validOpeningBalance && (
              <p className="text-xs text-red-400">
                Ingresa un saldo mayor o igual a cero, con máximo dos decimales.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cash-opening-notes" className="text-sm font-medium text-zinc-300">
              Notas <span className="font-normal text-zinc-600">(opcional)</span>
            </label>
            <textarea
              id="cash-opening-notes"
              value={openingNotes}
              onChange={(event) => setOpeningNotes(event.target.value)}
              disabled={openCashRegister.isPending}
              rows={3}
              className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20"
            />
          </div>

          {errorMessage && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={openCashRegister.isPending} className="border-white/10 bg-transparent text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit || openCashRegister.isPending} className="bg-red-500 text-white hover:bg-red-600">
              {openCashRegister.isPending ? (
                <><LoaderCircle className="h-4 w-4 animate-spin" />Abriendo...</>
              ) : (
                "Abrir caja"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
