"use client";

import {
  type FormEvent,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { useCreateCategory } from "@/hooks/use-categories";

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

type CreateCategoryDialogProps = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: Category) => void;
};

export default function CreateCategoryDialog({
  businessPublicId,
  open,
  onOpenChange,
  onCreated,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const createCategory = useCreateCategory();

  const trimmedName = name.trim();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createCategory.isPending) {
      return;
    }

    if (!nextOpen) {
      createCategory.reset();
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
      createCategory.isPending
    ) {
      return;
    }

    try {
      const category = await createCategory.mutateAsync({
        business_public_id: businessPublicId,
        name: trimmedName,
      });

      setName("");
      onCreated(category);
      onOpenChange(false);
    } catch {
      // React Query exposes the request error below.
    }
  }

  const errorMessage = createCategory.error
    ? createCategory.error instanceof Error
      ? createCategory.error.message
      : "No fue posible crear la categoría. Intenta nuevamente."
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>
            Nueva categoría
          </DialogTitle>

          <DialogDescription className="text-zinc-500">
            Crea una categoría para organizar los productos de tu negocio.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-sm font-medium text-zinc-300"
            >
              Nombre
            </label>

            <Input
              id="category-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ej. Accesorios"
              autoComplete="off"
              required
              disabled={createCategory.isPending}
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
              onClick={() =>
                handleOpenChange(false)
              }
              disabled={createCategory.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                !businessPublicId ||
                !trimmedName ||
                createCategory.isPending
              }
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {createCategory.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
