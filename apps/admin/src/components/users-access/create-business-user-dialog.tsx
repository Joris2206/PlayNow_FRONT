"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useCreateBusinessUser } from "@/hooks/use-business-memberships";

import MembershipRoleSelect from "@/components/users-access/membership-role-select";
import {
  getUsersAccessFieldError,
  getUsersAccessMutationError,
} from "@/components/users-access/users-access-errors";
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

import type { NonOwnerRole } from "@/types/business-membership";

type Props = {
  businessPublicId?: string;
  roles: readonly NonOwnerRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (message: string) => void;
};

type Field = "fullName" | "email" | "password" | "passwordConfirmation";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CreateBusinessUserDialog({
  businessPublicId,
  roles,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState<NonOwnerRole>(roles[0] ?? "viewer");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const mutation = useCreateBusinessUser();
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setFullName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setRole(roles[0] ?? "viewer");
    setTouched({});
    setAttemptedSubmit(false);
    resetMutation();
  }, [businessPublicId, open, resetMutation, roles]);

  const normalizedFullName = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const validEmail = isValidEmail(normalizedEmail);
  const passwordLongEnough = password.length >= 8;
  const passwordsMatch = password === passwordConfirmation;
  const showClientError = (field: Field) => attemptedSubmit || touched[field];
  const errors = {
    fullName:
      getUsersAccessFieldError(mutation.error, "full_name") ??
      (showClientError("fullName") && !normalizedFullName
        ? "Ingresa el nombre completo."
        : null),
    email:
      getUsersAccessFieldError(mutation.error, "email") ??
      (showClientError("email") && !validEmail
        ? "Ingresa un correo electrónico válido."
        : null),
    password:
      getUsersAccessFieldError(mutation.error, "password") ??
      (showClientError("password") && !passwordLongEnough
        ? "La contraseña debe tener al menos 8 caracteres."
        : null),
    passwordConfirmation:
      getUsersAccessFieldError(mutation.error, "password_confirmation") ??
      (showClientError("passwordConfirmation") && !passwordsMatch
        ? "Las contraseñas no coinciden."
        : null),
    role: getUsersAccessFieldError(mutation.error, "role"),
  };
  const canSubmit = Boolean(
    businessPublicId &&
      normalizedFullName &&
      validEmail &&
      passwordLongEnough &&
      passwordsMatch &&
      roles.includes(role) &&
      !mutation.isPending
  );
  const generalError = mutation.error
    ? getUsersAccessMutationError(
        mutation.error,
        "No fue posible crear el usuario con acceso."
      )
    : null;

  function clearPasswords() {
    setPassword("");
    setPasswordConfirmation("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;
    if (!nextOpen) {
      clearPasswords();
      mutation.reset();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId) return;

    try {
      await mutation.create({
        businessPublicId,
        data: {
          email: normalizedEmail,
          full_name: normalizedFullName,
          password,
          password_confirmation: passwordConfirmation,
          role,
        },
      });
      clearPasswords();
      mutation.reset();
      onCompleted("El usuario y su acceso se crearon correctamente.");
      onOpenChange(false);
    } catch {
      // The form stays open for field correction or a deliberate retry.
    }
  }

  const fields: Array<{
    field: Field;
    id: string;
    label: string;
    type: "text" | "email" | "password";
    value: string;
    autoComplete: string;
    onChange: (value: string) => void;
  }> = [
    { field: "fullName", id: "business-user-full-name", label: "Nombre completo", type: "text", value: fullName, autoComplete: "name", onChange: setFullName },
    { field: "email", id: "business-user-email", label: "Correo electrónico", type: "email", value: email, autoComplete: "email", onChange: setEmail },
    { field: "password", id: "business-user-password", label: "Contraseña", type: "password", value: password, autoComplete: "new-password", onChange: setPassword },
    { field: "passwordConfirmation", id: "business-user-password-confirmation", label: "Confirmar contraseña", type: "password", value: passwordConfirmation, autoComplete: "new-password", onChange: setPasswordConfirmation },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear usuario con acceso</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Crea una cuenta global y una membership activa para este negocio. No se creará un Employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => {
            const error = errors[field.field];
            return (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="text-sm font-medium text-zinc-300">
                  {field.label}
                </label>
                <Input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  autoComplete={field.autoComplete}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={() => setTouched((current) => ({ ...current, [field.field]: true }))}
                  disabled={mutation.isPending}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${field.id}-error` : undefined}
                  className="h-11 border-white/10 bg-white/5 text-white"
                />
                {error && (
                  <p id={`${field.id}-error`} className="text-xs text-red-400">
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          <div className="space-y-2">
            <label htmlFor="business-user-role" className="text-sm font-medium text-zinc-300">
              Rol local
            </label>
            <MembershipRoleSelect
              id="business-user-role"
              value={role}
              roles={roles}
              onChange={setRole}
              disabled={mutation.isPending}
              ariaInvalid={Boolean(errors.role)}
              ariaDescribedBy={errors.role ? "business-user-role-error" : undefined}
            />
            {errors.role && (
              <p id="business-user-role-error" className="text-xs text-red-400">
                {errors.role}
              </p>
            )}
          </div>

          {generalError && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {generalError}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} className="bg-red-500 text-white hover:bg-red-600">
              {mutation.isPending ? (
                <><LoaderCircle className="h-4 w-4 animate-spin" />Creando...</>
              ) : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
