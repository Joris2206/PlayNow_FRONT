"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useUpdateCategory } from "@/hooks/use-categories";

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

import type { Category } from "@/types/category";

type EditCategoryDialogProps = {
  category: Category | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditCategoryDialog({
  category,
  businessPublicId,
  open,
  onOpenChange,
}: EditCategoryDialogProps) {
  const [name, setName] = useState("");
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(category?.name ?? "");
    updateCategory.reset();
  }, [open, category]);

  const trimmedName = name.trim();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && updateCategory.isPending) {
      return;
    }

    if (!nextOpen) {
      updateCategory.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !category ||
      !businessPublicId ||
      !trimmedName ||
      updateCategory.isPending
    ) {
      return;
    }

    try {
      await updateCategory.mutateAsync({
        publicId: category.public_id,
        businessPublicId,
        data: {
          name: trimmedName,
        },
      });

      onOpenChange(false);
      updateCategory.reset();
    } catch {
      // React Query exposes the request error below.
    }
  }

  const errorMessage = updateCategory.error
    ? updateCategory.error instanceof Error
      ? updateCategory.error.message
      : "No fue posible actualizar la categoría. Intenta nuevamente."
    : null;

  if (!category) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>

          <DialogDescription className="text-zinc-500">
            Actualiza el nombre de la categoría del negocio activo.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="edit-category-name"
              className="text-sm font-medium text-zinc-300"
            >
              Nombre
            </label>

            <Input
              id="edit-category-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (updateCategory.isError) {
                  updateCategory.reset();
                }
              }}
              autoComplete="off"
              required
              disabled={updateCategory.isPending}
              className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
            />
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
              disabled={updateCategory.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                !businessPublicId ||
                !trimmedName ||
                updateCategory.isPending
              }
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {updateCategory.isPending ? (
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
