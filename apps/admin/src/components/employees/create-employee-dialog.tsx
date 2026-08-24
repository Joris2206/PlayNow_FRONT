"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useCreateEmployee } from "@/hooks/use-employees";

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

import type { Employee } from "@/types/employee";

type Field = "fullName" | "position" | "phone" | "email";

type Props = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (employee: Employee) => void;
};

export default function CreateEmployeeDialog({
  businessPublicId,
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const createEmployee = useCreateEmployee();
  const resetCreateEmployee = createEmployee.reset;

  useEffect(() => {
    if (!open) return;
    setFullName("");
    setPosition("");
    setPhone("");
    setEmail("");
    setTouched({});
    setAttemptedSubmit(false);
    resetCreateEmployee();
  }, [businessPublicId, open, resetCreateEmployee]);

  const normalizedName = fullName.trim();
  const normalizedPosition = position.trim();
  const normalizedPhone = phone.trim();
  const normalizedEmail = email.trim();
  const validEmail = isValidOptionalEmail(normalizedEmail);
  const canSubmit = Boolean(
    businessPublicId && normalizedName && normalizedPosition && validEmail
  );
  const errors = {
    fullName:
      getEmployeeApiFieldError(createEmployee.error, "full_name") ??
      ((attemptedSubmit || touched.fullName) && !normalizedName
        ? "Ingresa el nombre del empleado."
        : null),
    position:
      getEmployeeApiFieldError(createEmployee.error, "position") ??
      ((attemptedSubmit || touched.position) && !normalizedPosition
        ? "Ingresa el puesto del empleado."
        : null),
    phone: getEmployeeApiFieldError(createEmployee.error, "phone"),
    email:
      getEmployeeApiFieldError(createEmployee.error, "email") ??
      ((attemptedSubmit || touched.email) && !validEmail
        ? "Ingresa un correo válido."
        : null),
  };
  const nonFieldError =
    getEmployeeApiFieldError(createEmployee.error, "non_field_errors") ??
    getEmployeeApiFieldError(createEmployee.error, "business_public_id") ??
    getEmployeeApiFieldError(createEmployee.error, "detail");
  const hasFieldError = Object.values(errors).some(Boolean);
  const generalError =
    nonFieldError ??
    (createEmployee.error && !hasFieldError
      ? getEmployeeErrorMessage(
          createEmployee.error,
          "No fue posible crear el empleado."
        )
      : null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createEmployee.isPending) return;
    if (!nextOpen) createEmployee.reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (!canSubmit || !businessPublicId || createEmployee.isPending) return;

    try {
      const employee = await createEmployee.mutateAsync({
        business_public_id: businessPublicId,
        full_name: normalizedName,
        position: normalizedPosition,
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
      });
      onCreated(employee);
      onOpenChange(false);
    } catch {
      // React Query keeps backend field errors available in the dialog.
    }
  }

  function clearRequestError() {
    if (createEmployee.isError) createEmployee.reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Nuevo empleado</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Registra un empleado del negocio activo. Esto no crea acceso ni credenciales de inicio de sesión.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="employee-full-name" className="text-sm font-medium text-zinc-300">Nombre</label>
              <Input id="employee-full-name" value={fullName} onChange={(event) => { setFullName(event.target.value); clearRequestError(); }} onBlur={() => setTouched((current) => ({ ...current, fullName: true }))} required disabled={createEmployee.isPending} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "employee-full-name-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.fullName && <p id="employee-full-name-error" className="text-xs text-red-400">{errors.fullName}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="employee-position" className="text-sm font-medium text-zinc-300">Puesto</label>
              <Input id="employee-position" value={position} onChange={(event) => { setPosition(event.target.value); clearRequestError(); }} onBlur={() => setTouched((current) => ({ ...current, position: true }))} required disabled={createEmployee.isPending} aria-invalid={Boolean(errors.position)} aria-describedby={errors.position ? "employee-position-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.position && <p id="employee-position-error" className="text-xs text-red-400">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="employee-phone" className="text-sm font-medium text-zinc-300">Teléfono (opcional)</label>
              <Input id="employee-phone" type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); clearRequestError(); }} disabled={createEmployee.isPending} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "employee-phone-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.phone && <p id="employee-phone-error" className="text-xs text-red-400">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="employee-email" className="text-sm font-medium text-zinc-300">Correo (opcional)</label>
              <Input id="employee-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearRequestError(); }} onBlur={() => setTouched((current) => ({ ...current, email: true }))} disabled={createEmployee.isPending} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "employee-email-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />
              {errors.email && <p id="employee-email-error" className="text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>

          {generalError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{generalError}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createEmployee.isPending} className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancelar</Button>
            <Button type="submit" disabled={!canSubmit || createEmployee.isPending} className="bg-red-500 text-white hover:bg-red-600">
              {createEmployee.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creando...</> : "Crear empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
