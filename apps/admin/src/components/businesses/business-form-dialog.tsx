"use client";

import { type FormEvent, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import {
  useBusiness,
  useCreateBusiness,
  useUpdateBusiness,
} from "@/hooks/use-businesses";
import {
  extractDrfFieldError,
  getApiErrorMessage,
} from "@/lib/api-error";
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

import {
  isBusinessCapabilities,
  type Business,
} from "@/types/business";

type BusinessFormDialogProps = {
  business?: Business | null;
  isPlatformAdmin: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
};

export default function BusinessFormDialog({
  business,
  isPlatformAdmin,
  open,
  onOpenChange,
  onSaved,
}: BusinessFormDialogProps) {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("NIO");
  const [initialOwnerEmail, setInitialOwnerEmail] = useState("");
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();
  const businessQuery = useBusiness(
    business?.public_id,
    open && Boolean(business)
  );
  const currentBusiness =
    businessQuery.isSuccess &&
    !businessQuery.isFetching &&
    businessQuery.data.public_id === business?.public_id
      ? businessQuery.data
      : null;
  const currentCapabilities =
    currentBusiness &&
    isBusinessCapabilities(currentBusiness.capabilities)
      ? currentBusiness.capabilities
      : null;
  const mutation = business ? updateBusiness : createBusiness;

  useEffect(() => {
    if (!open) return;

    setBusinessName(business?.business_name ?? "");
    setDescription(business?.description ?? "");
    setCurrency(business?.currency ?? "NIO");
    setInitialOwnerEmail("");
  }, [business, open]);

  const trimmedName = businessName.trim();
  const trimmedCurrency = currency.trim().toUpperCase();
  const trimmedOwnerEmail = initialOwnerEmail.trim();
  const ownerEmailRequired = !business;
  const capabilitiesMayBeStale =
    updateBusiness.error instanceof HttpError &&
    [403, 404, 409].includes(updateBusiness.error.status);
  const canEdit =
    !business ||
    (currentCapabilities?.can_edit === true &&
      !capabilitiesMayBeStale);
  const canCreate = Boolean(business || isPlatformAdmin);
  const canSubmit =
    Boolean(trimmedName && trimmedCurrency) &&
    (!ownerEmailRequired || Boolean(trimmedOwnerEmail)) &&
    canEdit &&
    canCreate &&
    !mutation.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) return;

    if (!nextOpen) {
      createBusiness.reset();
      updateBusiness.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      if (business) {
        await updateBusiness.mutateAsync({
          publicId: business.public_id,
          data: {
            business_name: trimmedName,
            description: description.trim(),
            currency: trimmedCurrency,
          },
        });
        onSaved("Los datos del negocio se actualizaron correctamente.");
      } else {
        await createBusiness.mutateAsync({
          business_name: trimmedName,
          description: description.trim(),
          currency: trimmedCurrency,
          initial_owner_email: trimmedOwnerEmail,
        });
        onSaved("El negocio se creó correctamente.");
      }

      createBusiness.reset();
      updateBusiness.reset();
      onOpenChange(false);
    } catch {
      // The mutation keeps the form values and exposes the API error below.
    }
  }

  const error = mutation.error;
  const errorMessage = error
    ? getApiErrorMessage(
        error,
        business
          ? "No fue posible actualizar el negocio."
          : "No fue posible crear el negocio."
      )
    : null;
  const ownerEmailError = error
    ? extractDrfFieldError(
        error instanceof HttpError ? error.data : undefined,
        "initial_owner_email"
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {business ? "Editar negocio" : "Nuevo negocio"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {business
              ? "Actualiza únicamente la información general del negocio."
              : "El propietario inicial debe ser un usuario activo existente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="business-name" className="text-sm font-medium text-zinc-300">
              Nombre
            </label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              required
              disabled={mutation.isPending}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="business-description" className="text-sm font-medium text-zinc-300">
              Descripción <span className="text-zinc-600">(opcional)</span>
            </label>
            <textarea
              id="business-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={mutation.isPending}
              rows={3}
              className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="business-currency" className="text-sm font-medium text-zinc-300">
              Moneda
            </label>
            <Input
              id="business-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              required
              maxLength={3}
              disabled={mutation.isPending}
              placeholder="NIO"
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          {ownerEmailRequired && (
            <div className="space-y-2">
              <label htmlFor="business-owner-email" className="text-sm font-medium text-zinc-300">
                Correo del propietario inicial
              </label>
              <Input
                id="business-owner-email"
                type="email"
                value={initialOwnerEmail}
                onChange={(event) => setInitialOwnerEmail(event.target.value)}
                required
                disabled={mutation.isPending}
                aria-invalid={Boolean(ownerEmailError)}
                className="border-white/10 bg-white/5 text-white"
              />
              {ownerEmailError && (
                <p className="text-sm text-red-300">{ownerEmailError}</p>
              )}
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {business &&
            (businessQuery.isPending || businessQuery.isFetching) && (
              <div role="status" className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                Verificando las capacidades actuales del negocio...
              </div>
            )}

          {business && businessQuery.isError && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              No fue posible verificar si la edición continúa disponible.
            </div>
          )}

          {business &&
            businessQuery.isSuccess &&
            !businessQuery.isFetching &&
            !currentCapabilities && (
              <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                La respuesta del negocio está incompleta y no permite editarlo de forma segura.
              </div>
            )}

          {business && currentCapabilities && !canEdit && (
            <div role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              La edición ya no está disponible. Las capacidades del negocio fueron actualizadas.
            </div>
          )}

          {!business && !canCreate && (
            <div role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Solo un administrador de plataforma puede crear negocios.
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending} className="border-white/10 bg-transparent text-white">
              Cancelar
            </Button>
            {canEdit && canCreate && (
              <Button type="submit" disabled={!canSubmit} className="bg-red-500 text-white hover:bg-red-600">
                {mutation.isPending ? (
                  <><LoaderCircle className="h-4 w-4 animate-spin" />Guardando...</>
                ) : business ? "Guardar cambios" : "Crear negocio"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
