"use client";

import { LoaderCircle } from "lucide-react";

import { useDeleteProduct } from "@/hooks/use-products";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Product } from "@/types/product";

type DeleteProductDialogProps = {
  product: Product | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteProductDialog({
  product,
  businessPublicId,
  open,
  onOpenChange,
}: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && deleteProduct.isPending) {
      return;
    }

    if (!nextOpen) {
      deleteProduct.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleDelete() {
    if (
      !product ||
      !businessPublicId ||
      deleteProduct.isPending
    ) {
      return;
    }

    try {
      await deleteProduct.mutateAsync({
        publicId: product.public_id,
        businessPublicId,
      });

      onOpenChange(false);
      deleteProduct.reset();
    } catch {
      // React Query exposes the request error below.
    }
  }

  const errorMessage = deleteProduct.error
    ? deleteProduct.error instanceof Error
      ? deleteProduct.error.message
      : "No fue posible eliminar el producto. Intenta nuevamente."
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>
            ¿Eliminar “{product?.title}”?
          </DialogTitle>

          <DialogDescription className="text-zinc-500">
            El producto cambiará a estado Eliminado y continuará visible en el listado administrativo. Esta acción realiza una baja del producto.
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
            disabled={deleteProduct.isPending}
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={
              !product ||
              !businessPublicId ||
              deleteProduct.isPending
            }
          >
            {deleteProduct.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar producto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
