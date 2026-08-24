"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useUpdatePaymentMethod } from "@/hooks/use-payment-methods";

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

type EditPaymentMethodDialogProps = {
  paymentMethod: PaymentMethod | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditPaymentMethodDialog({
  paymentMethod,
  businessPublicId,
  open,
  onOpenChange,
}: EditPaymentMethodDialogProps) {
  const [name, setName] = useState("");
  const [methodType, setMethodType] =
    useState<PaymentMethodType | "">("");
  const updatePaymentMethod = useUpdatePaymentMethod();
  const resetUpdatePaymentMethod =
    updatePaymentMethod.reset;

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(paymentMethod?.name ?? "");
    setMethodType(paymentMethod?.method_type ?? "");
    resetUpdatePaymentMethod();
  }, [open, paymentMethod, resetUpdatePaymentMethod]);

  const trimmedName = name.trim();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && updatePaymentMethod.isPending) {
      return;
    }

    if (!nextOpen) {
      updatePaymentMethod.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !paymentMethod ||
      !businessPublicId ||
      !trimmedName ||
      !methodType ||
      updatePaymentMethod.isPending
    ) {
      return;
    }

    try {
      await updatePaymentMethod.mutateAsync({
        publicId: paymentMethod.public_id,
        businessPublicId,
        data: {
          name: trimmedName,
          method_type: methodType,
        },
      });

      onOpenChange(false);
      updatePaymentMethod.reset();
    } catch {
      // Keep the dialog open so the backend error can be corrected.
    }
  }

  const errorMessage = updatePaymentMethod.error
    ? getPaymentMethodErrorMessage(
        updatePaymentMethod.error,
        "No fue posible actualizar el método de pago."
      )
    : null;

  if (!paymentMethod) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Editar método de pago</DialogTitle>

          <DialogDescription className="text-zinc-500">
            Actualiza el nombre o tipo del método seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="edit-payment-method-name"
              className="text-sm font-medium text-zinc-300"
            >
              Nombre
            </label>

            <Input
              id="edit-payment-method-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (updatePaymentMethod.isError) {
                  updatePaymentMethod.reset();
                }
              }}
              autoComplete="off"
              required
              disabled={updatePaymentMethod.isPending}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-payment-method-type"
              className="text-sm font-medium text-zinc-300"
            >
              Tipo
            </label>

            <select
              id="edit-payment-method-type"
              value={methodType}
              onChange={(event) => {
                setMethodType(
                  event.target.value as PaymentMethodType
                );

                if (updatePaymentMethod.isError) {
                  updatePaymentMethod.reset();
                }
              }}
              required
              disabled={updatePaymentMethod.isPending}
              className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus-visible:border-red-500/50 focus-visible:ring-2 focus-visible:ring-red-500/20"
            >
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
              disabled={updatePaymentMethod.isPending}
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
                updatePaymentMethod.isPending
              }
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {updatePaymentMethod.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
