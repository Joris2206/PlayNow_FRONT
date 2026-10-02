"use client";

import { useState } from "react";
import {
  CreditCard,
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { useUpdatePaymentMethod } from "@/hooks/use-payment-methods";
import {
  findStatusByName,
  getCatalogStatusClassName,
  isActiveCatalogStatus,
  isRecoverableProductStatus,
  isTerminalCatalogStatus,
} from "@/lib/catalog-status";
import { cn } from "@/lib/utils";

import DeletePaymentMethodDialog from "@/components/payment-methods/delete-payment-method-dialog";
import EditPaymentMethodDialog from "@/components/payment-methods/edit-payment-method-dialog";
import {
  getPaymentMethodErrorMessage,
  PAYMENT_METHOD_TYPE_LABELS,
} from "@/components/payment-methods/payment-methods-format";
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

import type { EntityStatus } from "@/types/entity-status";
import type { PaymentMethod } from "@/types/payment-method";

type PaymentMethodsTableProps = {
  paymentMethods: PaymentMethod[];
  businessPublicId?: string;
  canManage: boolean;
  statuses: EntityStatus[];
  statusesLoading: boolean;
  statusesError: boolean;
};

export default function PaymentMethodsTable({
  paymentMethods,
  businessPublicId,
  canManage,
  statuses,
  statusesLoading,
  statusesError,
}: PaymentMethodsTableProps) {
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [deletingPaymentMethod, setDeletingPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [statusPaymentMethod, setStatusPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const updatePaymentMethod = useUpdatePaymentMethod();

  const activeStatus = findStatusByName(statuses, "Activo");
  const inactiveStatus = findStatusByName(
    statuses,
    "Inactivo"
  );
  const missingRequiredStatuses =
    canManage &&
    !statusesLoading &&
    !statusesError &&
    (!activeStatus || !inactiveStatus);

  async function handleStatusChange(
    paymentMethod: PaymentMethod,
    statusPublicId: string
  ) {
    if (!businessPublicId || updatePaymentMethod.isPending) {
      return;
    }

    setStatusPaymentMethod(paymentMethod);

    try {
      await updatePaymentMethod.mutateAsync({
        publicId: paymentMethod.public_id,
        businessPublicId,
        data: { status_public_id: statusPublicId },
      });

      setStatusPaymentMethod(null);
    } catch {
      // React Query exposes the request error below.
    }
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <CreditCard className="h-6 w-6" />
        </div>

        <h3 className="font-medium text-white">
          No hay métodos de pago
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos métodos que coincidan con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <>
      {canManage && statusesError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          No fue posible cargar las acciones de estado. Intenta nuevamente.
        </div>
      )}

      {missingRequiredStatuses && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
        >
          No están disponibles los estados Activo e Inactivo necesarios para cambiar el estado.
        </div>
      )}

      {updatePaymentMethod.isPending && statusPaymentMethod && (
        <div
          className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300"
          aria-live="polite"
        >
          Actualizando el estado de {statusPaymentMethod.name}...
        </div>
      )}

      {updatePaymentMethod.isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {getPaymentMethodErrorMessage(
            updatePaymentMethod.error,
            "No fue posible actualizar el estado del método de pago."
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table stickyHeader className="min-w-[720px]">
            <TableHeader className="border-b border-white/10 bg-white/[0.02]">
              <TableRow className="border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500 hover:bg-transparent">
                <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
                  Nombre
                </TableHead>

                <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
                  Tipo
                </TableHead>

                <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
                  Estado
                </TableHead>

                <TableHead className="h-auto w-24 px-5 py-4 text-right font-medium text-zinc-500">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paymentMethods.map((paymentMethod) => {
                const isActive = isActiveCatalogStatus(
                  paymentMethod.status_name
                );
                const isRecoverable =
                  isRecoverableProductStatus(
                    paymentMethod.status_name
                  );
                const isTerminal = isTerminalCatalogStatus(
                  paymentMethod.status_name
                );
                const targetStatus = isActive
                  ? inactiveStatus
                  : isRecoverable
                    ? activeStatus
                    : undefined;
                const statusActionLabel = isActive
                  ? "Desactivar método"
                  : isRecoverable
                    ? "Reactivar método"
                    : null;
                const isStatusActionPending =
                  updatePaymentMethod.isPending &&
                  statusPaymentMethod?.public_id ===
                    paymentMethod.public_id;

                return (
                  <TableRow
                    key={paymentMethod.public_id}
                    className="border-white/10 hover:bg-white/[0.025]"
                  >
                    <TableCell className="px-5 py-4 font-medium text-white">
                      {paymentMethod.name}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-zinc-300">
                      {
                        PAYMENT_METHOD_TYPE_LABELS[
                          paymentMethod.method_type
                        ]
                      }
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                          getCatalogStatusClassName(
                            paymentMethod.status_name
                          )
                        )}
                      >
                        {paymentMethod.status_name}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-right">
                      {canManage ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isStatusActionPending}
                              aria-label={`Abrir acciones de ${paymentMethod.name}`}
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
                              {paymentMethod.name}
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                              onSelect={() =>
                                setEditingPaymentMethod(paymentMethod)
                              }
                            >
                              <Pencil />
                              Editar método
                            </DropdownMenuItem>

                            {statusActionLabel && (
                              <DropdownMenuItem
                                disabled={
                                  !targetStatus ||
                                  updatePaymentMethod.isPending ||
                                  statusesLoading ||
                                  statusesError
                                }
                                onSelect={() => {
                                  if (targetStatus) {
                                    void handleStatusChange(
                                      paymentMethod,
                                      targetStatus.public_id
                                    );
                                  }
                                }}
                              >
                                {isActive ? <Power /> : <RotateCcw />}
                                {statusesLoading
                                  ? "Cargando estados..."
                                  : targetStatus
                                    ? statusActionLabel
                                    : `${statusActionLabel} no disponible`}
                              </DropdownMenuItem>
                            )}

                            {!isTerminal && (
                              <>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  variant="destructive"
                                  disabled={updatePaymentMethod.isPending}
                                  onSelect={() =>
                                    setDeletingPaymentMethod(paymentMethod)
                                  }
                                >
                                  <Trash2 />
                                  Eliminar método
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditPaymentMethodDialog
        businessPublicId={businessPublicId}
        paymentMethod={editingPaymentMethod}
        open={Boolean(editingPaymentMethod)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPaymentMethod(null);
          }
        }}
      />

      <DeletePaymentMethodDialog
        businessPublicId={businessPublicId}
        paymentMethod={deletingPaymentMethod}
        open={Boolean(deletingPaymentMethod)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPaymentMethod(null);
          }
        }}
      />
    </>
  );
}
