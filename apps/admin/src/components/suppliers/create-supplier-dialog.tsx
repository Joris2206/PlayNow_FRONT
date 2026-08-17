"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useCreateSupplier } from "@/hooks/use-suppliers";
import { HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Supplier } from "@/types/supplier";

type Props = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (supplier: Supplier) => void;
};
type Field = "name" | "phone" | "email";

function getApiFieldError(error: unknown, field: string) {
  if (!(error instanceof HttpError) || typeof error.data !== "object" || error.data === null || !(field in error.data)) return null;
  const value = (error.data as Record<string, unknown>)[field];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CreateSupplierDialog({ businessPublicId, open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const createSupplier = useCreateSupplier();
  const resetCreateSupplier = createSupplier.reset;

  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("");
    setEmail("");
    setTouched({});
    setAttemptedSubmit(false);
    resetCreateSupplier();
  }, [businessPublicId, open, resetCreateSupplier]);

  const normalizedName = name.trim();
  const normalizedPhone = phone.trim();
  const normalizedEmail = email.trim();
  const validEmail = isValidEmail(normalizedEmail);
  const canSubmit = Boolean(businessPublicId && normalizedName && normalizedPhone && validEmail);
  const errors = {
    name: getApiFieldError(createSupplier.error, "name") ?? ((attemptedSubmit || touched.name) && !normalizedName ? "Ingresa el nombre del proveedor." : null),
    phone: getApiFieldError(createSupplier.error, "phone") ?? ((attemptedSubmit || touched.phone) && !normalizedPhone ? "Ingresa el teléfono del proveedor." : null),
    email: getApiFieldError(createSupplier.error, "email") ?? ((attemptedSubmit || touched.email) && !validEmail ? "Ingresa un correo válido." : null),
  };
  const nonFieldError = getApiFieldError(createSupplier.error, "non_field_errors") ?? getApiFieldError(createSupplier.error, "business_public_id");
  const hasFieldError = Object.values(errors).some(Boolean);
  const generalError = nonFieldError ?? (createSupplier.error && !hasFieldError ? createSupplier.error instanceof Error ? createSupplier.error.message : "No fue posible crear el proveedor." : null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createSupplier.isPending) return;
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId || createSupplier.isPending) return;
    try {
      const supplier = await createSupplier.mutateAsync({
        business_public_id: businessPublicId,
        name: normalizedName,
        phone: normalizedPhone,
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
      });
      onCreated(supplier);
      onOpenChange(false);
    } catch {
      // React Query exposes field and request errors above.
    }
  }

  return <Dialog open={open} onOpenChange={handleOpenChange}>
    <DialogContent className="border-white/10 bg-zinc-950 text-white">
      <DialogHeader><DialogTitle>Nuevo proveedor</DialogTitle><DialogDescription className="text-zinc-500">Registra un proveedor para el negocio activo.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2"><label htmlFor="supplier-name" className="text-sm font-medium text-zinc-300">Proveedor</label><Input id="supplier-name" value={name} onChange={(event) => setName(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, name: true }))} disabled={createSupplier.isPending} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "supplier-name-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />{errors.name && <p id="supplier-name-error" className="text-xs text-red-400">{errors.name}</p>}</div>
        <div className="space-y-2"><label htmlFor="supplier-phone" className="text-sm font-medium text-zinc-300">Teléfono</label><Input id="supplier-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} disabled={createSupplier.isPending} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "supplier-phone-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />{errors.phone && <p id="supplier-phone-error" className="text-xs text-red-400">{errors.phone}</p>}</div>
        <div className="space-y-2"><label htmlFor="supplier-email" className="text-sm font-medium text-zinc-300">Correo (opcional)</label><Input id="supplier-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, email: true }))} disabled={createSupplier.isPending} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "supplier-email-error" : undefined} className="h-11 border-white/10 bg-white/5 text-white" />{errors.email && <p id="supplier-email-error" className="text-xs text-red-400">{errors.email}</p>}</div>
        {generalError && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{generalError}</div>}
        {!createSupplier.isPending && !canSubmit && attemptedSubmit && <p className="text-sm text-zinc-400" aria-live="polite">Completa los campos requeridos antes de crear el proveedor.</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createSupplier.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="submit" disabled={!canSubmit || createSupplier.isPending} className="bg-red-500 text-white hover:bg-red-600">{createSupplier.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Creando...</> : "Crear proveedor"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
