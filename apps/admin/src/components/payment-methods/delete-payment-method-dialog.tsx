"use client";

import { LoaderCircle } from "lucide-react";

import { useDeletePaymentMethod } from "@/hooks/use-payment-methods";

import { getPaymentMethodErrorMessage } from "@/components/payment-methods/payment-methods-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { PaymentMethod } from "@/types/payment-method";

type DeletePaymentMethodDialogProps = {
  paymentMethod: PaymentMethod | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeletePaymentMethodDialog({
  paymentMethod,
  businessPublicId,
  open,
  onOpenChange,
}: DeletePaymentMethodDialogProps) {
  const deletePaymentMethod = useDeletePaymentMethod();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && deletePaymentMethod.isPending) {
      return;
    }

    if (!nextOpen) {
      deletePaymentMethod.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleDelete() {
    if (
      !paymentMethod ||
      !businessPublicId ||
      deletePaymentMethod.isPending
    ) {
      return;
    }

    try {
      await deletePaymentMethod.mutateAsync({
        publicId: paymentMethod.public_id,
        businessPublicId,
      });

      onOpenChange(false);
      deletePaymentMethod.reset();
    } catch {
      // The mutation error remains visible in this dialog.
    }
  }

  const errorMessage = deletePaymentMethod.error
    ? getPaymentMethodErrorMessage(
        deletePaymentMethod.error,
        "No fue posible eliminar el método de pago."
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>
            ¿Eliminar “{paymentMethod?.name}”?
          </DialogTitle>

          <DialogDescription className="text-zinc-500">
            El método cambiará a estado Eliminado y continuará visible en el listado administrativo.
          </DialogDescription>
        </DialogHeader>

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
            disabled={deletePaymentMethod.isPending}
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={
              !paymentMethod ||
              !businessPublicId ||
              deletePaymentMethod.isPending
            }
          >
            {deletePaymentMethod.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar método"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
