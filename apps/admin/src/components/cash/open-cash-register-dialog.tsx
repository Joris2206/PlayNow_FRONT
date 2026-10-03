"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useEmployee } from "@/hooks/use-employees";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { useOpenCashRegister } from "@/hooks/use-cash-registers";
import { findStatusByName } from "@/lib/catalog-status";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";

import CashEmployeeSelectorDialog from "@/components/cash/cash-employee-selector-dialog";
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
  const [employeePublicId, setEmployeePublicId] =
    useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);
  const [employeeSelectorOpen, setEmployeeSelectorOpen] =
    useState(false);
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
  const initialEmployeeQuery = useEmployee({
    businessPublicId:
      open && initialEmployeePublicId
        ? businessPublicId
        : undefined,
    publicId:
      open ? initialEmployeePublicId ?? undefined : undefined,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmployeePublicId(initialEmployeePublicId ?? "");
    setSelectedEmployee(null);
    setEmployeeSelectorOpen(false);
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

  useEffect(() => {
    if (
      !open ||
      !initialEmployeePublicId ||
      employeePublicId !== initialEmployeePublicId ||
      selectedEmployee ||
      !initialEmployeeQuery.data ||
      initialEmployeeQuery.data.business_public_id !== businessPublicId
    ) {
      return;
    }

    setSelectedEmployee({
      public_id: initialEmployeeQuery.data.public_id,
      full_name: initialEmployeeQuery.data.full_name,
      position: initialEmployeeQuery.data.position,
    });
  }, [
    businessPublicId,
    employeePublicId,
    initialEmployeeQuery.data,
    initialEmployeePublicId,
    open,
    selectedEmployee,
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Selecciona al empleado responsable e indica el efectivo inicial contado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section
            className="space-y-2"
            aria-labelledby="cash-open-employee-label"
            aria-describedby={attemptedSubmit && !employeePublicId ? "cash-open-employee-error" : undefined}
          >
            <h3 id="cash-open-employee-label" className="text-sm font-medium text-zinc-300">
              Empleado responsable
            </h3>
            <div className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              attemptedSubmit && !employeePublicId
                ? "border-red-500/50 bg-red-500/5"
                : employeePublicId
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-dashed border-white/10 bg-white/[0.02]"
            }`}>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {employeePublicId ? "Empleado seleccionado" : "Sin empleado seleccionado"}
                </p>
                {employeePublicId && (
                  <>
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {selectedEmployee?.full_name ?? (initialEmployeeQuery.isLoading ? "Cargando empleado..." : "Empleado asociado a tu membresía")}
                    </p>
                    {selectedEmployee?.position && (
                      <p className="mt-1 truncate text-xs text-zinc-400">{selectedEmployee.position}</p>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="inverseOutline"
                  size={employeePublicId ? "sm" : "default"}
                  onClick={() => setEmployeeSelectorOpen(true)}
                  disabled={!businessPublicId || !activeStatus || openCashRegister.isPending}
                  aria-invalid={attemptedSubmit && !employeePublicId}
                >
                  {employeePublicId ? "Cambiar" : "Seleccionar empleado"}
                </Button>
                {employeePublicId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEmployeePublicId("");
                      setSelectedEmployee(null);
                    }}
                    disabled={openCashRegister.isPending}
                    aria-label="Quitar empleado responsable de la caja"
                    className="text-zinc-400 hover:bg-white/5 hover:text-white"
                  >
                    Quitar
                  </Button>
                )}
              </div>
            </div>
            {attemptedSubmit && !employeePublicId && (
              <p id="cash-open-employee-error" className="text-xs text-red-400">
                Selecciona al empleado responsable de la caja.
              </p>
            )}
            {initialEmployeeQuery.isError && employeePublicId === initialEmployeePublicId && !selectedEmployee && (
              <p role="alert" className="text-sm text-red-300">No fue posible cargar los datos del empleado asociado.</p>
            )}
            {statusesQuery.isError && (
              <p role="alert" className="text-sm text-red-300">
                No fue posible encontrar el estado Activo de los empleados.
              </p>
            )}
            {statusesQuery.isSuccess && !activeStatus && (
              <p role="alert" className="text-sm text-amber-300">
                No existe el estado Activo necesario para consultar empleados.
              </p>
            )}
          </section>

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
        <CashEmployeeSelectorDialog
          businessPublicId={businessPublicId}
          activeStatusPublicId={activeStatus?.public_id}
          selectedEmployeePublicId={employeePublicId}
          selectedEmployee={selectedEmployee}
          open={employeeSelectorOpen}
          disabled={openCashRegister.isPending}
          onOpenChange={setEmployeeSelectorOpen}
          onSelect={(employee) => {
            setSelectedEmployee(employee);
            setEmployeePublicId(employee.public_id);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
