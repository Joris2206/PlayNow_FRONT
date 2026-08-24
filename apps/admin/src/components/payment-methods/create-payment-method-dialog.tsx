"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useCreatePaymentMethod } from "@/hooks/use-payment-methods";

import {
  getPaymentMethodErrorMessage,
  PAYMENT_METHOD_TYPE_OPTIONS,
} from "@/components/payment-methods/payment-methods-format";
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

import type {
  PaymentMethod,
  PaymentMethodType,
} from "@/types/payment-method";

type CreatePaymentMethodDialogProps = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (paymentMethod: PaymentMethod) => void;
};

export default function CreatePaymentMethodDialog({
  businessPublicId,
  open,
  onOpenChange,
  onCreated,
}: CreatePaymentMethodDialogProps) {
  const [name, setName] = useState("");
  const [methodType, setMethodType] =
    useState<PaymentMethodType | "">("");
  const createPaymentMethod = useCreatePaymentMethod();
  const resetCreatePaymentMethod =
    createPaymentMethod.reset;

  useEffect(() => {
    if (open) {
      setName("");
      setMethodType("");
      resetCreatePaymentMethod();
    }
  }, [open, resetCreatePaymentMethod]);

  const trimmedName = name.trim();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createPaymentMethod.isPending) {
      return;
    }

    if (!nextOpen) {
      createPaymentMethod.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !businessPublicId ||
      !trimmedName ||
      !methodType ||
      createPaymentMethod.isPending
    ) {
      return;
    }

    try {
      const paymentMethod =
        await createPaymentMethod.mutateAsync({
          business_public_id: businessPublicId,
          name: trimmedName,
          method_type: methodType,
        });

      onCreated(paymentMethod);
      onOpenChange(false);
      setName("");
      setMethodType("");
      createPaymentMethod.reset();
    } catch {
      // The mutation error remains visible in this dialog.
    }
  }

  const errorMessage = createPaymentMethod.error
    ? getPaymentMethodErrorMessage(
        createPaymentMethod.error,
        "No fue posible crear el método de pago."
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Nuevo método de pago</DialogTitle>

          <DialogDescription className="text-zinc-500">
            Registra una opción de pago para el negocio activo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="payment-method-name"
              className="text-sm font-medium text-zinc-300"
            >
              Nombre
            </label>

            <Input
              id="payment-method-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (createPaymentMethod.isError) {
                  createPaymentMethod.reset();
                }
              }}
              placeholder="Ej. Efectivo"
              autoComplete="off"
              required
              disabled={createPaymentMethod.isPending}
              className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="payment-method-type"
              className="text-sm font-medium text-zinc-300"
            >
              Tipo
            </label>

            <select
              id="payment-method-type"
              value={methodType}
              onChange={(event) => {
                setMethodType(
                  event.target.value as PaymentMethodType | ""
                );

                if (createPaymentMethod.isError) {
                  createPaymentMethod.reset();
                }
              }}
              required
              disabled={createPaymentMethod.isPending}
              className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus-visible:border-red-500/50 focus-visible:ring-2 focus-visible:ring-red-500/20"
            >
              <option value="" className="bg-zinc-950">
                Selecciona un tipo
              </option>

              {PAYMENT_METHOD_TYPE_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-zinc-950"
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createPaymentMethod.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                !businessPublicId ||
                !trimmedName ||
                !methodType ||
                createPaymentMethod.isPending
              }
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {createPaymentMethod.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear método"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
