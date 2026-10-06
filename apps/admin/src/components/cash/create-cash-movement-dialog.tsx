"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useCreateCashMovement } from "@/hooks/use-cash-movements";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { findStatusByName } from "@/lib/catalog-status";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";

import {
  CASH_MONEY_INPUT_PATTERN,
  CASH_MOVEMENT_TYPE_OPTIONS,
  EMPLOYEE_REQUIRED_MOVEMENT_TYPES,
  getCashErrorMessage,
} from "@/components/cash/cash-format";
import CashEmployeeSelectorDialog from "@/components/cash/cash-employee-selector-dialog";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/components/payment-methods/payment-methods-format";
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

import type { CashMovementType } from "@/types/cash";
import type { EmployeeOption } from "@/types/employee";
import type { PaymentMethod } from "@/types/payment-method";

const SELECT_PAGE_SIZE = 20;

type CreateCashMovementDialogProps = {
  businessPublicId?: string;
  cashRegisterPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateCashMovementDialog({
  businessPublicId,
  cashRegisterPublicId,
  open,
  onOpenChange,
}: CreateCashMovementDialogProps) {
  const [movementType, setMovementType] =
    useState<CashMovementType | "">("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [employeePublicId, setEmployeePublicId] =
    useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);
  const [employeeSelectorOpen, setEmployeeSelectorOpen] =
    useState(false);
  const [paymentMethodPage, setPaymentMethodPage] =
    useState(1);
  const [paymentMethodPublicId, setPaymentMethodPublicId] =
    useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] =
    useState(false);
  const createMovement = useCreateCashMovement();
  const resetCreateMovement = createMovement.reset;

  const employeeRequired =
    movementType !== "" &&
    EMPLOYEE_REQUIRED_MOVEMENT_TYPES.has(movementType);
  const statusesQuery = useEntityStatuses(
    open && employeeRequired
  );
  const activeStatus = findStatusByName(
    statusesQuery.data?.results ?? [],
    "Activo"
  );
  const paymentMethodsQuery = usePaymentMethods({
    businessPublicId: open ? businessPublicId : undefined,
    page: paymentMethodPage,
    pageSize: SELECT_PAGE_SIZE,
    ordering: "name",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setMovementType("");
    setAmount("");
    setNote("");
    setEmployeePublicId("");
    setSelectedEmployee(null);
    setEmployeeSelectorOpen(false);
    setPaymentMethodPage(1);
    setPaymentMethodPublicId("");
    setSelectedPaymentMethod(null);
    setAttemptedSubmit(false);
    resetCreateMovement();
  }, [
    businessPublicId,
    cashRegisterPublicId,
    open,
    resetCreateMovement,
  ]);

  const paymentMethods = useMemo(() => {
    const listed = paymentMethodsQuery.data?.results ?? [];

    return selectedPaymentMethod &&
      !listed.some(
        (method) =>
          method.public_id === selectedPaymentMethod.public_id
      )
      ? [selectedPaymentMethod, ...listed]
      : listed;
  }, [paymentMethodsQuery.data, selectedPaymentMethod]);

  const amountMinor = toMoneyMinorUnits(amount);
  const validAmount = amountMinor !== null && amountMinor > 0n;
  const canSubmit = Boolean(
    businessPublicId &&
      cashRegisterPublicId &&
      movementType &&
      validAmount &&
      (!employeeRequired || employeePublicId)
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createMovement.isPending) {
      return;
    }

    if (!nextOpen) {
      resetCreateMovement();
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
      !cashRegisterPublicId ||
      !movementType ||
      createMovement.isPending
    ) {
      return;
    }

    try {
      await createMovement.mutateAsync({
        businessPublicId,
        data: {
          cash_register_public_id: cashRegisterPublicId,
          movement_type: movementType,
          amount,
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(employeeRequired
            ? { employee_public_id: employeePublicId }
            : {}),
          ...(paymentMethodPublicId
            ? {
                payment_method_public_id:
                  paymentMethodPublicId,
              }
            : {}),
        },
      });

      onOpenChange(false);
    } catch {
      // Keep the dialog open with the backend validation error.
    }
  }

  const errorMessage = createMovement.error
    ? getCashErrorMessage(
        createMovement.error,
        "No fue posible registrar el movimiento."
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Registra una entrada o salida manual contra la caja abierta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="cash-movement-type" className="text-sm font-medium text-zinc-300">
              Tipo de movimiento
            </label>
            <select
              id="cash-movement-type"
              value={movementType}
              onChange={(event) => {
                const nextType = event.target.value as CashMovementType | "";
                setMovementType(nextType);

                if (
                  nextType === "" ||
                  !EMPLOYEE_REQUIRED_MOVEMENT_TYPES.has(nextType)
                ) {
                  setEmployeePublicId("");
                  setSelectedEmployee(null);
                  setEmployeeSelectorOpen(false);
                }
              }}
              disabled={createMovement.isPending}
              aria-invalid={attemptedSubmit && !movementType}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20"
            >
              <option value="">Selecciona un tipo</option>
              {CASH_MOVEMENT_TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {attemptedSubmit && !movementType && (
              <p className="text-xs text-red-400">
                Selecciona un tipo de movimiento.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cash-movement-amount" className="text-sm font-medium text-zinc-300">
              Importe
            </label>
            <Input
              id="cash-movement-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                if (CASH_MONEY_INPUT_PATTERN.test(event.target.value)) {
                  setAmount(event.target.value);
                }
              }}
              disabled={createMovement.isPending}
              aria-invalid={attemptedSubmit && !validAmount}
              placeholder="0.00"
              className="h-11 border-white/10 bg-black/30 text-white"
            />
            {attemptedSubmit && !validAmount && (
              <p className="text-xs text-red-400">
                Ingresa un importe mayor que cero, con máximo dos decimales.
              </p>
            )}
          </div>

          {employeeRequired && (
            <section
              className="space-y-2"
              aria-labelledby="cash-movement-employee-label"
              aria-describedby={attemptedSubmit && !employeePublicId ? "cash-movement-employee-error" : undefined}
            >
              <h3 id="cash-movement-employee-label" className="text-sm font-medium text-zinc-300">
                Empleado
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
                  {selectedEmployee && (
                    <>
                      <p className="mt-1 truncate text-sm font-medium text-white">{selectedEmployee.full_name}</p>
                      {selectedEmployee.position && (
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
                    disabled={!businessPublicId || !activeStatus || createMovement.isPending}
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
                      disabled={createMovement.isPending}
                      aria-label="Quitar empleado del movimiento de caja"
                      className="text-zinc-400 hover:bg-white/5 hover:text-white"
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
              {attemptedSubmit && !employeePublicId && (
                <p id="cash-movement-employee-error" className="text-xs text-red-400">
                  Este tipo de movimiento requiere un empleado.
                </p>
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
          )}

          <div className="space-y-2">
            <label htmlFor="cash-movement-payment-method" className="text-sm font-medium text-zinc-300">
              Método de pago <span className="font-normal text-zinc-600">(opcional)</span>
            </label>
            <select
              id="cash-movement-payment-method"
              value={paymentMethodPublicId}
              onChange={(event) => {
                const publicId = event.target.value;
                setPaymentMethodPublicId(publicId);
                setSelectedPaymentMethod(
                  paymentMethods.find(
                    (method) => method.public_id === publicId
                  ) ?? null
                );
              }}
              disabled={paymentMethodsQuery.isLoading || createMovement.isPending}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"
            >
              <option value="">
                {paymentMethodsQuery.isLoading
                  ? "Cargando métodos..."
                  : "Sin método asociado"}
              </option>
              {paymentMethods.map((method) => (
                <option key={method.public_id} value={method.public_id}>
                  {method.name} · {PAYMENT_METHOD_TYPE_LABELS[method.method_type]}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-zinc-600">
              Es un dato opcional. El tipo seleccionado determina cómo afecta este movimiento a la caja.
            </p>
            {paymentMethodsQuery.isError && (
              <div className="flex items-center justify-between gap-3 text-sm text-red-300">
                <span>No fue posible cargar los métodos de pago.</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => paymentMethodsQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            )}
            {paymentMethodsQuery.data && paymentMethodsQuery.data.total_pages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!paymentMethodsQuery.data.previous || createMovement.isPending} onClick={() => setPaymentMethodPage((current) => Math.max(1, current - 1))} className="border-white/10 bg-transparent text-zinc-300">
                  Anterior
                </Button>
                <span className="text-xs text-zinc-500">
                  Página {paymentMethodsQuery.data.current_page} de {paymentMethodsQuery.data.total_pages}
                </span>
                <Button type="button" variant="outline" size="sm" disabled={!paymentMethodsQuery.data.next || createMovement.isPending} onClick={() => setPaymentMethodPage((current) => current + 1)} className="border-white/10 bg-transparent text-zinc-300">
                  Siguiente
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cash-movement-note" className="text-sm font-medium text-zinc-300">
              Nota <span className="font-normal text-zinc-600">(opcional)</span>
            </label>
            <Input
              id="cash-movement-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={createMovement.isPending}
              maxLength={255}
              className="h-11 border-white/10 bg-black/30 text-white"
            />
          </div>

          {errorMessage && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createMovement.isPending} className="border-white/10 bg-transparent text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit || createMovement.isPending} className="bg-red-500 text-white hover:bg-red-600">
              {createMovement.isPending ? (
                <><LoaderCircle className="h-4 w-4 animate-spin" />Registrando...</>
              ) : (
                "Registrar movimiento"
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
          disabled={createMovement.isPending}
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
