"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import CommissionEmployeeSelect from "@/components/commissions/commission-employee-select";
import DateInput from "@/components/shared/date-input";
import {
  COMMISSION_PERCENTAGE_PATTERN,
  getCommissionErrorMessage,
  getCommissionFieldError,
  isValidCommissionPercentage,
} from "@/components/commissions/commissions-format";
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
  useCommissionPlan,
  useCreateCommissionPlan,
  usePatchCommissionPlan,
} from "@/hooks/use-commission-plans";
import type {
  CommissionPlan,
  PatchCommissionPlanInput,
} from "@/types/commission";
import type { EmployeeOption } from "@/types/employee";

type Props = {
  businessPublicId?: string;
  plan: CommissionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (plan: CommissionPlan) => void;
};

export default function CommissionPlanFormDialog({
  businessPublicId,
  plan,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const detailQuery = useCommissionPlan(
    open && plan ? businessPublicId : undefined,
    open ? plan?.public_id : undefined
  );
  const source = detailQuery.data ?? plan;
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);
  const [percentage, setPercentage] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const createPlan = useCreateCommissionPlan();
  const patchPlan = usePatchCommissionPlan();
  const resetCreatePlan = createPlan.reset;
  const resetPatchPlan = patchPlan.reset;
  const mutation = plan ? patchPlan : createPlan;

  useEffect(() => {
    if (!open) return;
    setEmployeePublicId(source?.employee_public_id ?? "");
    setSelectedEmployee(
      source
        ? {
            public_id: source.employee_public_id,
            full_name: source.employee_name,
            position: "",
          }
        : null
    );
    setPercentage(source?.percentage ?? "");
    setValidFrom(source?.valid_from ?? "");
    setValidUntil(source?.valid_until ?? "");
    setIsActive(source?.is_active ?? true);
    setAttemptedSubmit(false);
    resetCreatePlan();
    resetPatchPlan();
  }, [open, source, resetCreatePlan, resetPatchPlan]);

  const validPercentage = isValidCommissionPercentage(percentage);
  const validDates = Boolean(
    validFrom && (!validUntil || validUntil >= validFrom)
  );
  const changes = useMemo<PatchCommissionPlanInput>(() => {
    if (!source) return {};
    const next: PatchCommissionPlanInput = {};
    if (employeePublicId !== source.employee_public_id) {
      next.employee_public_id = employeePublicId;
    }
    if (percentage !== source.percentage) next.percentage = percentage;
    if (validFrom !== source.valid_from) next.valid_from = validFrom;
    if ((validUntil || null) !== source.valid_until) {
      next.valid_until = validUntil || null;
    }
    if (isActive !== source.is_active) next.is_active = isActive;
    return next;
  }, [employeePublicId, isActive, percentage, source, validFrom, validUntil]);
  const hasChanges = Object.keys(changes).length > 0;
  const canSubmit = Boolean(
    businessPublicId &&
      employeePublicId &&
      validPercentage &&
      validDates &&
      (!plan || (source && hasChanges))
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) mutation.reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId || mutation.isPending) return;
    try {
      const saved = source
        ? await patchPlan.mutateAsync({
            publicId: source.public_id,
            businessPublicId,
            previousEmployeePublicId: source.employee_public_id,
            data: changes,
          })
        : await createPlan.mutateAsync({
            business_public_id: businessPublicId,
            employee_public_id: employeePublicId,
            percentage,
            valid_from: validFrom,
            valid_until: validUntil || null,
            is_active: isActive,
          });
      onSaved(saved);
      onOpenChange(false);
    } catch {
      // React Query keeps the backend validation error visible.
    }
  }

  const error = mutation.error;
  const employeeError = getCommissionFieldError(
    error,
    "employee_public_id"
  );
  const percentageError = getCommissionFieldError(error, "percentage");
  const validFromError = getCommissionFieldError(error, "valid_from");
  const validUntilError = getCommissionFieldError(error, "valid_until");
  const generalError = error
    ? getCommissionErrorMessage(error, "No fue posible guardar el plan.")
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar plan" : "Nuevo plan"}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Define el porcentaje y período de vigencia para el empleado.
          </DialogDescription>
        </DialogHeader>
        {plan && detailQuery.isLoading && (
          <p className="text-sm text-zinc-500">Actualizando plan...</p>
        )}
        {detailQuery.isError && (
          <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {getCommissionErrorMessage(
              detailQuery.error,
              "No fue posible cargar el plan."
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <CommissionEmployeeSelect
            id="commission-plan-employee"
            label="Empleado"
            businessPublicId={businessPublicId}
            value={employeePublicId}
            selectedEmployee={selectedEmployee}
            activeOnly
            required
            invalid={attemptedSubmit && !employeePublicId}
            disabled={mutation.isPending}
            onChange={(publicId, employee) => {
              setEmployeePublicId(publicId);
              setSelectedEmployee(employee);
              mutation.reset();
            }}
          />
          {(employeeError || (attemptedSubmit && !employeePublicId)) && (
            <p className="text-xs text-red-400">
              {employeeError ?? "Selecciona un empleado."}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="commission-plan-percentage" className="text-sm font-medium text-zinc-300">
              Porcentaje
            </label>
            <Input
              id="commission-plan-percentage"
              type="text"
              inputMode="decimal"
              value={percentage}
              placeholder="0.00"
              disabled={mutation.isPending}
              aria-invalid={Boolean(percentageError || (attemptedSubmit && !validPercentage))}
              onChange={(event) => {
                if (COMMISSION_PERCENTAGE_PATTERN.test(event.target.value)) {
                  setPercentage(event.target.value);
                  mutation.reset();
                }
              }}
              className="border-white/10 bg-black/30 text-white"
            />
            {(percentageError || (attemptedSubmit && !validPercentage)) && (
              <p className="text-xs text-red-400">
                {percentageError ?? "Ingresa un decimal entre 0 y 100."}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="commission-plan-valid-from" className="text-sm font-medium text-zinc-300">Válido desde</label>
              <DateInput id="commission-plan-valid-from" pickerLabel="Abrir calendario de vigencia inicial" value={validFrom} disabled={mutation.isPending} aria-invalid={Boolean(validFromError || (attemptedSubmit && !validFrom))} onChange={(event) => { setValidFrom(event.target.value); mutation.reset(); }} className="border-white/10 bg-black/30 text-white" />
              {(validFromError || (attemptedSubmit && !validFrom)) && <p className="text-xs text-red-400">{validFromError ?? "Selecciona la fecha inicial."}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="commission-plan-valid-until" className="text-sm font-medium text-zinc-300">Válido hasta <span className="font-normal text-zinc-600">(opcional)</span></label>
              <DateInput id="commission-plan-valid-until" pickerLabel="Abrir calendario de vigencia final" value={validUntil} min={validFrom || undefined} disabled={mutation.isPending} aria-invalid={Boolean(validUntilError || (attemptedSubmit && !validDates))} onChange={(event) => { setValidUntil(event.target.value); mutation.reset(); }} className="border-white/10 bg-black/30 text-white" />
              {(validUntilError || (attemptedSubmit && !validDates)) && <p className="text-xs text-red-400">{validUntilError ?? "La fecha final no puede ser anterior a la inicial."}</p>}
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-300">
            <input type="checkbox" checked={isActive} disabled={mutation.isPending} onChange={(event) => { setIsActive(event.target.checked); mutation.reset(); }} className="h-4 w-4 accent-red-500" />
            Plan activo
          </label>
          {generalError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{generalError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button>
            <Button type="submit" disabled={!canSubmit || mutation.isPending || detailQuery.isError} className="bg-red-500 text-white hover:bg-red-600">
              {mutation.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Guardando...</> : "Guardar plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
