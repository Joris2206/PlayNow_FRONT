"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useCreateCustomer } from "@/hooks/use-customers";
import { HttpError } from "@/lib/http";

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

import type { Customer } from "@/types/customer";

type Props = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
};

type Field = "fullName" | "phone" | "email";

function getApiFieldError(error: unknown, field: string) {
  if (
    !(error instanceof HttpError) ||
    typeof error.data !== "object" ||
    error.data === null ||
    !(field in error.data)
  ) {
    return null;
  }

  const value = (error.data as Record<string, unknown>)[field];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return null;
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CreateCustomerDialog({
  businessPublicId,
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<
    Partial<Record<Field, boolean>>
  >({});
  const [attemptedSubmit, setAttemptedSubmit] =
    useState(false);
  const createCustomer = useCreateCustomer();
  const resetCreateCustomer = createCustomer.reset;

  useEffect(() => {
    if (!open) return;
    setFullName("");
    setPhone("");
    setEmail("");
    setTouched({});
    setAttemptedSubmit(false);
    resetCreateCustomer();
  }, [businessPublicId, open, resetCreateCustomer]);

  const normalizedName = fullName.trim();
  const normalizedPhone = phone.trim();
  const normalizedEmail = email.trim();
  const validEmail = isValidEmail(normalizedEmail);
  const canSubmit = Boolean(
    businessPublicId &&
      normalizedName &&
      normalizedPhone &&
      validEmail
  );

  const errors = {
    fullName:
      getApiFieldError(createCustomer.error, "full_name") ??
      ((attemptedSubmit || touched.fullName) && !normalizedName
        ? "Ingresa el nombre del cliente."
        : null),
    phone:
      getApiFieldError(createCustomer.error, "phone") ??
      ((attemptedSubmit || touched.phone) && !normalizedPhone
        ? "Ingresa el teléfono del cliente."
        : null),
    email:
      getApiFieldError(createCustomer.error, "email") ??
      ((attemptedSubmit || touched.email) && !validEmail
        ? "Ingresa un correo válido."
        : null),
  };

  const nonFieldError =
    getApiFieldError(createCustomer.error, "non_field_errors") ??
    getApiFieldError(createCustomer.error, "business_public_id");
  const hasFieldError = Object.values(errors).some(Boolean);
  const generalError =
    nonFieldError ??
    (createCustomer.error && !hasFieldError
      ? createCustomer.error instanceof Error
        ? createCustomer.error.message
        : "No fue posible crear el cliente."
      : null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createCustomer.isPending) return;
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId || createCustomer.isPending) {
      return;
    }

    try {
      const customer = await createCustomer.mutateAsync({
        business_public_id: businessPublicId,
        full_name: normalizedName,
        phone: normalizedPhone,
        email: normalizedEmail,
      });
      onCreated(customer);
      onOpenChange(false);
    } catch {
      // React Query exposes field and request errors above.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Registra un cliente para el negocio activo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="customer-full-name" className="text-sm font-medium text-zinc-300">
              Nombre completo
            </label>
            <Input
              id="customer-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
              disabled={createCustomer.isPending}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "customer-full-name-error" : undefined}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
            {errors.fullName && <p id="customer-full-name-error" className="text-xs text-red-400">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-phone" className="text-sm font-medium text-zinc-300">
              Teléfono
            </label>
            <Input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
              disabled={createCustomer.isPending}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "customer-phone-error" : undefined}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
            {errors.phone && <p id="customer-phone-error" className="text-xs text-red-400">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="customer-email" className="text-sm font-medium text-zinc-300">
              Correo (opcional)
            </label>
            <Input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              disabled={createCustomer.isPending}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "customer-email-error" : undefined}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
            {errors.email && <p id="customer-email-error" className="text-xs text-red-400">{errors.email}</p>}
          </div>

          {generalError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{generalError}</div>}

          {!createCustomer.isPending && !canSubmit && attemptedSubmit && (
            <p className="text-sm text-zinc-400" aria-live="polite">
              Completa los campos requeridos antes de crear el cliente.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createCustomer.isPending} className="border-white/10 bg-transparent text-white">
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit || createCustomer.isPending} className="bg-red-500 text-white hover:bg-red-600">
              {createCustomer.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creando...</> : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
