"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useUpdateEmployee } from "@/hooks/use-employees";

import {
  getEmployeeApiFieldError,
  getEmployeeErrorMessage,
  isValidOptionalEmail,
} from "@/components/employees/employees-format";
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

import type { Employee, UpdateEmployeeRequest } from "@/types/employee";

type Field = "fullName" | "position" | "email";

type Props = {
  employee: Employee | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditEmployeeDialog({
  employee,
  businessPublicId,
  open,
  onOpenChange,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const updateEmployee = useUpdateEmployee();
  const resetUpdateEmployee = updateEmployee.reset;

  useEffect(() => {
    if (!open || !employee) return;
    setFullName(employee.full_name);
    setPosition(employee.position);
    setPhone(employee.phone);
    setEmail(employee.email);
    setTouched({});
    setAttemptedSubmit(false);
    resetUpdateEmployee();
  }, [businessPublicId, employee, open, resetUpdateEmployee]);

  if (!employee) return null;

  const normalizedName = fullName.trim();
  const normalizedPosition = position.trim();
  const normalizedPhone = phone.trim();
  const normalizedEmail = email.trim();
  const validEmail = isValidOptionalEmail(normalizedEmail);
  const changes: UpdateEmployeeRequest = {};
  if (normalizedName !== employee.full_name) changes.full_name = normalizedName;
  if (normalizedPosition !== employee.position) changes.position = normalizedPosition;
  if (normalizedPhone !== employee.phone) changes.phone = normalizedPhone;
  if (normalizedEmail !== employee.email) changes.email = normalizedEmail;
  const hasChanges = Object.keys(changes).length > 0;
  const canSubmit = Boolean(
    businessPublicId && normalizedName && normalizedPosition && validEmail && hasChanges
  );
  const errors = {
    fullName:
      getEmployeeApiFieldError(updateEmployee.error, "full_name") ??
      ((attemptedSubmit || touched.fullName) && !normalizedName
        ? "Ingresa el nombre del empleado."
        : null),
    position:
      getEmployeeApiFieldError(updateEmployee.error, "position") ??
      ((attemptedSubmit || touched.position) && !normalizedPosition
        ? "Ingresa el puesto del empleado."
        : null),
    phone: getEmployeeApiFieldError(updateEmployee.error, "phone"),
    email:
      getEmployeeApiFieldError(updateEmployee.error, "email") ??
      ((attemptedSubmit || touched.email) && !validEmail
        ? "Ingresa un correo válido."
        : null),
  };
  const nonFieldError =
    getEmployeeApiFieldError(updateEmployee.error, "non_field_errors") ??
    getEmployeeApiFieldError(updateEmployee.error, "detail");
  const hasFieldError = Object.values(errors).some(Boolean);
  const generalError =
    nonFieldError ??
    (updateEmployee.error && !hasFieldError
      ? getEmployeeErrorMessage(
          updateEmployee.error,
          "No fue posible actualizar el empleado."
        )
      : null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && updateEmployee.isPending) return;
    if (!nextOpen) updateEmployee.reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (
      !employee ||
      !canSubmit ||
      !businessPublicId ||
      updateEmployee.isPending
    ) return;

    try {
      await updateEmployee.mutateAsync({
        publicId: employee.public_id,
        businessPublicId,
        data: changes,
      });
      onOpenChange(false);
    } catch {
      // Keep the dialog open with backend field errors.
    }
  }

  function clearRequestError() {
    if (updateEmployee.isError) updateEmployee.reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Editar empleado</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Actualiza los datos administrativos del empleado seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="edit-employee-full-name" className="text-sm font-medium text-zinc-300">Nombre</label>
              <Input id="edit-employee-full-name" value={fullName} onChange={(event) => { setFullName(event.target.value); clearRequestError(); }} onBlur={() => setTouched((current) => ({ ...current, fullName: true }))} required disabled={updateEmployee.isPending} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "edit-employee-full-name-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.fullName && <p id="edit-employee-full-name-error" className="text-xs text-red-400">{errors.fullName}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="edit-employee-position" className="text-sm font-medium text-zinc-300">Puesto</label>
              <Input id="edit-employee-position" value={position} onChange={(event) => { setPosition(event.target.value); clearRequestError(); }} onBlur={() => setTouched((current) => ({ ...current, position: true }))} required disabled={updateEmployee.isPending} aria-invalid={Boolean(errors.position)} aria-describedby={errors.position ? "edit-employee-position-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.position && <p id="edit-employee-position-error" className="text-xs text-red-400">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-employee-phone" className="text-sm font-medium text-zinc-300">Teléfono (opcional)</label>
              <Input id="edit-employee-phone" type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); clearRequestError(); }} disabled={updateEmployee.isPending} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "edit-employee-phone-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.phone && <p id="edit-employee-phone-error" className="text-xs text-red-400">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-employee-email" className="text-sm font-medium text-zinc-300">Correo (opcional)</label>
              <Input id="edit-employee-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearRequestError(); }} onBlur={() => setTouched((current) => ({ ...current, email: true }))} disabled={updateEmployee.isPending} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "edit-employee-email-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.email && <p id="edit-employee-email-error" className="text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>

          {generalError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{generalError}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={updateEmployee.isPending} className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancelar</Button>
            <Button type="submit" disabled={!canSubmit || updateEmployee.isPending} className="bg-red-500 text-white hover:bg-red-600">
              {updateEmployee.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Guardando...</> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
