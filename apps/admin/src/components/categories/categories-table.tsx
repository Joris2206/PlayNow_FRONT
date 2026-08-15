"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  Tags,
  Trash2,
} from "lucide-react";

import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { useUpdateCategory } from "@/hooks/use-categories";
import {
  findStatusByName,
  getCatalogStatusClassName,
  isActiveCatalogStatus,
  isRecoverableProductStatus,
  isTerminalCatalogStatus,
} from "@/lib/catalog-status";
import { hasAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import DeleteCategoryDialog from "@/components/categories/delete-category-dialog";
import EditCategoryDialog from "@/components/categories/edit-category-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Category } from "@/types/category";

type CategoriesTableProps = {
  categories: Category[];
};

export default function CategoriesTable({
  categories,
}: CategoriesTableProps) {
  const { activeMembership } = useAuth();
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);
  const [statusCategory, setStatusCategory] =
    useState<Category | null>(null);

  const role = activeMembership?.role;
  const businessPublicId =
    activeMembership?.business_public_id;
  const canEdit = hasAccess(role, "catalog-edit");
  const canDelete = hasAccess(role, "catalog-delete");
  const statusesQuery = useEntityStatuses(canEdit);
  const updateCategoryStatus = useUpdateCategory();

  const statuses = statusesQuery.data?.results ?? [];
  const activeStatus = findStatusByName(
    statuses,
    "Activo"
  );
  const inactiveStatus = findStatusByName(
    statuses,
    "Inactivo"
  );
  const missingRequiredStatuses =
    canEdit &&
    statusesQuery.isSuccess &&
    (!activeStatus || !inactiveStatus);

  async function handleStatusChange(
    category: Category,
    statusPublicId: string
  ) {
    if (
      !businessPublicId ||
      updateCategoryStatus.isPending
    ) {
      return;
    }

    setStatusCategory(category);

    try {
      await updateCategoryStatus.mutateAsync({
        publicId: category.public_id,
        businessPublicId,
        data: {
          status_public_id: statusPublicId,
        },
      });

      setStatusCategory(null);
    } catch {
      // React Query exposes the request error below.
    }
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <Tags className="h-6 w-6" />
        </div>

        <h3 className="font-medium text-white">
          No hay categorías
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos categorías que coincidan con la búsqueda actual.
        </p>
      </div>
    );
  }

  return (
    <>
      {canEdit && statusesQuery.isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {statusesQuery.error instanceof Error
            ? statusesQuery.error.message
            : "No fue posible cargar las acciones de estado. Intenta nuevamente."}
        </div>
      )}

      {missingRequiredStatuses && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
        >
          El catálogo no contiene los estados Activo e Inactivo necesarios para cambiar el estado de la categoría.
        </div>
      )}

      {updateCategoryStatus.isPending && statusCategory && (
        <div
          className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
          aria-live="polite"
        >
          Actualizando el estado de {statusCategory.name}...
        </div>
      )}

      {updateCategoryStatus.isError &&
        updateCategoryStatus.error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {updateCategoryStatus.error instanceof Error
              ? updateCategoryStatus.error.message
              : "No fue posible actualizar el estado de la categoría."}
          </div>
        )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="border-b border-white/10 bg-white/[0.02]">
              <TableRow className="border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500 hover:bg-transparent">
                <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
                  Categoría
                </TableHead>

                <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
                  Estado
                </TableHead>

                <TableHead className="h-auto w-16 px-5 py-4" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((category) => {
                const canDeleteCategory =
                  canDelete &&
                  !isTerminalCatalogStatus(
                    category.status_name
                  );
                const hasCategoryActions =
                  canEdit || canDeleteCategory;
                const isActive = isActiveCatalogStatus(
                  category.status_name
                );
                const isRecoverable =
                  isRecoverableProductStatus(
                    category.status_name
                  );
                const targetStatus = isActive
                  ? inactiveStatus
                  : isRecoverable
                    ? activeStatus
                    : undefined;
                const statusActionLabel = isActive
                  ? "Desactivar categoría"
                  : isRecoverable
                    ? "Reactivar categoría"
                    : null;
                const isStatusActionPending =
                  updateCategoryStatus.isPending &&
                  statusCategory?.public_id ===
                    category.public_id;

                return (
                  <TableRow
                    key={category.public_id}
                    className="border-white/10 hover:bg-white/[0.025]"
                  >
                    <TableCell className="px-5 py-4 font-medium text-white">
                      {category.name}
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                          getCatalogStatusClassName(
                            category.status_name
                          )
                        )}
                      >
                        {category.status_name}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-right">
                      {hasCategoryActions && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isStatusActionPending}
                              aria-label={`Abrir acciones de ${category.name}`}
                              data-category-public-id={category.public_id}
                              className="text-zinc-500 hover:bg-white/5 hover:text-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-56 border-white/10 bg-zinc-950 text-zinc-300"
                          >
                            <DropdownMenuLabel className="truncate text-xs text-zinc-500">
                              {category.name}
                            </DropdownMenuLabel>

                            {canEdit && (
                              <DropdownMenuItem
                                onSelect={() =>
                                  setEditingCategory(category)
                                }
                              >
                                <Pencil />
                                Editar categoría
                              </DropdownMenuItem>
                            )}

                            {canEdit && statusActionLabel && (
                              <DropdownMenuItem
                                disabled={
                                  !targetStatus ||
                                  updateCategoryStatus.isPending ||
                                  statusesQuery.isLoading ||
                                  statusesQuery.isError
                                }
                                onSelect={() => {
                                  if (targetStatus) {
                                    void handleStatusChange(
                                      category,
                                      targetStatus.public_id
                                    );
                                  }
                                }}
                              >
                                {isActive ? (
                                  <Power />
                                ) : (
                                  <RotateCcw />
                                )}
                                {statusesQuery.isLoading
                                  ? "Cargando estados..."
                                  : targetStatus
                                    ? statusActionLabel
                                    : `${statusActionLabel} no disponible`}
                              </DropdownMenuItem>
                            )}

                            {canDeleteCategory && (
                              <>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  variant="destructive"
                                  disabled={
                                    updateCategoryStatus.isPending
                                  }
                                  onSelect={() =>
                                    setDeletingCategory(category)
                                  }
                                >
                                  <Trash2 />
                                  Eliminar categoría
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditCategoryDialog
        businessPublicId={businessPublicId}
        category={editingCategory}
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
          }
        }}
      />

      <DeleteCategoryDialog
        businessPublicId={businessPublicId}
        category={deletingCategory}
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCategory(null);
          }
        }}
      />
    </>
  );
}
