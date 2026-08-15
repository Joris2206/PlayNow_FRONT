"use client";

import { LoaderCircle } from "lucide-react";

import { useDeleteCategory } from "@/hooks/use-categories";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Category } from "@/types/category";

type DeleteCategoryDialogProps = {
  category: Category | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteCategoryDialog({
  category,
  businessPublicId,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && deleteCategory.isPending) {
      return;
    }

    if (!nextOpen) {
      deleteCategory.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleDelete() {
    if (
      !category ||
      !businessPublicId ||
      deleteCategory.isPending
    ) {
      return;
    }

    try {
      await deleteCategory.mutateAsync({
        publicId: category.public_id,
        businessPublicId,
      });

      onOpenChange(false);
      deleteCategory.reset();
    } catch {
      // React Query exposes the request error below.
    }
  }

  const errorMessage = deleteCategory.error
    ? deleteCategory.error instanceof Error
      ? deleteCategory.error.message
      : "No fue posible eliminar la categoría. Intenta nuevamente."
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>
            ¿Eliminar “{category?.name}”?
          </DialogTitle>

          <DialogDescription className="text-zinc-500">
            La categoría cambiará a estado Eliminado y continuará visible en el listado administrativo. Esta acción realiza una baja de la categoría.
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
            disabled={deleteCategory.isPending}
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={
              !category ||
              !businessPublicId ||
              deleteCategory.isPending
            }
          >
            {deleteCategory.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar categoría"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
