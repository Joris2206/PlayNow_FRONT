"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  PackageSearch,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { useUpdateProduct } from "@/hooks/use-products";
import { hasAccess } from "@/lib/permissions";
import {
  findStatusByName,
  getCatalogStatusClassName,
  isActiveCatalogStatus,
  isRecoverableProductStatus,
  isTerminalCatalogStatus,
} from "@/lib/catalog-status";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { EditProductDialog } from "@/components/products/create-product-dialog";
import DeleteProductDialog from "@/components/products/delete-product-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Product } from "@/types/product";

type ProductsTableProps = {
  products: Product[];
};

function formatMoney(value: string) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
  }).format(number);
}

export default function ProductsTable({
  products,
}: ProductsTableProps) {
  const { activeMembership } = useAuth();
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] =
    useState<Product | null>(null);
  const [statusProduct, setStatusProduct] =
    useState<Product | null>(null);

  const role = activeMembership?.role;
  const businessPublicId =
    activeMembership?.business_public_id;
  const canEdit = hasAccess(role, "catalog-edit");
  const canDelete = hasAccess(role, "catalog-delete");
  const statusesQuery = useEntityStatuses(canEdit);
  const updateProductStatus = useUpdateProduct();

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
    product: Product,
    statusPublicId: string
  ) {
    if (
      !businessPublicId ||
      updateProductStatus.isPending
    ) {
      return;
    }

    setStatusProduct(product);

    try {
      await updateProductStatus.mutateAsync({
        publicId: product.public_id,
        businessPublicId,
        data: {
          status_public_id: statusPublicId,
        },
      });

      setStatusProduct(null);
    } catch {
      // React Query exposes the request error below.
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <PackageSearch className="h-6 w-6" />
        </div>

        <h3 className="font-medium text-white">
          No hay productos
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos productos que coincidan con los filtros actuales.
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
          El catálogo no contiene los estados Activo e Inactivo necesarios para cambiar el estado del producto.
        </div>
      )}

      {updateProductStatus.isPending && statusProduct && (
        <div
          className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
          aria-live="polite"
        >
          Actualizando el estado de {statusProduct.title}...
        </div>
      )}

      {updateProductStatus.isError &&
        updateProductStatus.error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {updateProductStatus.error instanceof Error
            ? updateProductStatus.error.message
            : "No fue posible actualizar el estado del producto."}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-4 font-medium">
                Producto
              </th>

              <th className="px-5 py-4 font-medium">
                Categoría
              </th>

              <th className="px-5 py-4 font-medium">
                Precio
              </th>

              <th className="px-5 py-4 font-medium">
                Costo
              </th>

              <th className="px-5 py-4 font-medium">
                Stock
              </th>

              <th className="px-5 py-4 font-medium">
                Estado
              </th>

              <th className="w-16 px-5 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {products.map((product) => {
              const canDeleteProduct =
                canDelete &&
                !isTerminalCatalogStatus(
                  product.status_name
                );
              const hasProductActions =
                canEdit || canDeleteProduct;
              const isActive = isActiveCatalogStatus(
                product.status_name
              );
              const isRecoverable =
                isRecoverableProductStatus(
                  product.status_name
                );
              const targetStatus = isActive
                ? inactiveStatus
                : isRecoverable
                  ? activeStatus
                  : undefined;
              const statusActionLabel = isActive
                ? "Desactivar producto"
                : isRecoverable
                  ? "Reactivar producto"
                  : null;
              const isStatusActionPending =
                updateProductStatus.isPending &&
                statusProduct?.public_id ===
                  product.public_id;

              return (
              <tr
                key={product.public_id}
                className="transition hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-white">
                      {product.title}
                    </p>

                    {product.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                        {product.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-zinc-400">
                  {product.category_name ?? "Sin categoría"}
                </td>

                <td className="px-5 py-4 text-sm font-medium text-white">
                  {formatMoney(product.base_price)}
                </td>

                <td className="px-5 py-4 text-sm text-zinc-400">
                  {formatMoney(product.base_cost)}
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm text-zinc-300">
                    {product.stock}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                      getCatalogStatusClassName(
                        product.status_name
                      )
                    )}
                  >
                    {product.status_name}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  {hasProductActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isStatusActionPending}
                          aria-label={`Abrir acciones de ${product.title}`}
                          data-product-public-id={product.public_id}
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
                        {product.title}
                      </DropdownMenuLabel>

                      {canEdit && (
                        <DropdownMenuItem
                          onSelect={() =>
                            setEditingProduct(product)
                          }
                        >
                          <Pencil />
                          Editar producto
                        </DropdownMenuItem>
                      )}

                      {canEdit && statusActionLabel && (
                        <DropdownMenuItem
                          disabled={
                            !targetStatus ||
                            updateProductStatus.isPending ||
                            statusesQuery.isLoading ||
                            statusesQuery.isError
                          }
                          onSelect={() => {
                            if (targetStatus) {
                              void handleStatusChange(
                                product,
                                targetStatus.public_id
                              );
                            }
                          }}
                        >
                          {isActive ? <Power /> : <RotateCcw />}
                          {statusesQuery.isLoading
                            ? "Cargando estados..."
                            : targetStatus
                              ? statusActionLabel
                              : `${statusActionLabel} no disponible`}
                        </DropdownMenuItem>
                      )}

                      {canDeleteProduct && (
                        <>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            disabled={
                              updateProductStatus.isPending
                            }
                            onSelect={() =>
                              setDeletingProduct(product)
                            }
                          >
                            <Trash2 />
                            Eliminar producto
                          </DropdownMenuItem>
                        </>
                      )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      <EditProductDialog
        businessPublicId={businessPublicId}
        product={editingProduct}
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
      />

      <DeleteProductDialog
        businessPublicId={businessPublicId}
        product={deletingProduct}
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProduct(null);
          }
        }}
      />
    </>
  );
}
