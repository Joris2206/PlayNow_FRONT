"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  CircleDollarSign,
  LockKeyhole,
  LoaderCircle,
  Plus,
} from "lucide-react";

import { useCashMovements } from "@/hooks/use-cash-movements";
import {
  useCashRegisterPreview,
  useCashRegisters,
} from "@/hooks/use-cash-registers";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

import CashMovementsTable from "@/components/cash/cash-movements-table";
import CashRegisterHistory from "@/components/cash/cash-register-history";
import CashRegisterSummary from "@/components/cash/cash-register-summary";
import CloseCashRegisterDialog from "@/components/cash/close-cash-register-dialog";
import CreateCashMovementDialog from "@/components/cash/create-cash-movement-dialog";
import {
  formatCashDate,
  formatCashMoney,
  getCashErrorMessage,
} from "@/components/cash/cash-format";
import OpenCashRegisterDialog from "@/components/cash/open-cash-register-dialog";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const DEFAULT_MOVEMENT_PAGE_SIZE = 10;
const DEFAULT_HISTORY_PAGE_SIZE = 10;

export default function CashPage() {
  const { activeMembership, isLoading: isAuthLoading } =
    useAuth();
  const businessPublicId =
    activeMembership?.business_public_id;
  const canUseCash = hasAccess(activeMembership?.role, "cash");

  const [movementPage, setMovementPage] = useState(1);
  const [movementPageSize, setMovementPageSize] = useState(
    DEFAULT_MOVEMENT_PAGE_SIZE
  );
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(
    DEFAULT_HISTORY_PAGE_SIZE
  );
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] =
    useState(false);
  const [closeDialogOpen, setCloseDialogOpen] =
    useState(false);

  useEffect(() => {
    setMovementPage(1);
    setMovementPageSize(DEFAULT_MOVEMENT_PAGE_SIZE);
    setHistoryPage(1);
    setHistoryPageSize(DEFAULT_HISTORY_PAGE_SIZE);
    setOpenDialogOpen(false);
    setMovementDialogOpen(false);
    setCloseDialogOpen(false);
  }, [businessPublicId]);

  const scopedBusinessPublicId =
    canUseCash && !isAuthLoading
      ? businessPublicId
      : undefined;
  const openRegistersQuery = useCashRegisters({
    businessPublicId: scopedBusinessPublicId,
    status: "open",
    page: 1,
    pageSize: 1,
    ordering: "-open_time",
  });
  const historyQuery = useCashRegisters({
    businessPublicId: scopedBusinessPublicId,
    status: "closed",
    page: historyPage,
    pageSize: historyPageSize,
    ordering: "-close_time",
  });
  const openRegister =
    openRegistersQuery.data?.results[0] ?? null;
  const previewQuery = useCashRegisterPreview(
    scopedBusinessPublicId,
    openRegister?.public_id
  );
  const movementsQuery = useCashMovements({
    businessPublicId: scopedBusinessPublicId,
    cashRegisterPublicId: openRegister?.public_id,
    page: movementPage,
    pageSize: movementPageSize,
    ordering: "-created_at",
  });

  useEffect(() => {
    setMovementPage(1);
    setMovementDialogOpen(false);
    setCloseDialogOpen(false);
  }, [openRegister?.public_id]);

  if (!isAuthLoading && !canUseCash) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Acceso no disponible
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tu rol no tiene permiso para consultar u operar caja.
          </p>
        </div>
      </div>
    );
  }

  async function refreshPreview() {
    const result = await previewQuery.refetch();
    return !result.isError;
  }

  async function handleOpenCloseDialog() {
    await previewQuery.refetch();
    setCloseDialogOpen(true);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Finanzas"
        title="Caja"
        description="Controla la apertura, los movimientos manuales y el cierre usando los cálculos autoritativos de PlayNow API."
      />

      {(isAuthLoading || openRegistersQuery.isLoading) && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">
              Consultando caja abierta...
            </p>
          </div>
        </div>
      )}

      {openRegistersQuery.isError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h2 className="mt-4 font-medium text-white">
            No pudimos consultar la caja abierta
          </h2>
          <p className="mt-2 text-sm text-red-300">
            {getCashErrorMessage(
              openRegistersQuery.error,
              "No fue posible consultar la caja."
            )}
          </p>
          <Button type="button" variant="outline" onClick={() => openRegistersQuery.refetch()} className="mt-4 border-white/10 bg-transparent text-white">
            Reintentar
          </Button>
        </div>
      )}

      {openRegistersQuery.isSuccess && !openRegister && (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <span className="mt-5 inline-flex rounded-full border border-zinc-500/20 bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-300">
            Sin caja abierta
          </span>
          <h2 className="mt-4 text-xl font-semibold text-white">
            Abre una caja para comenzar
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Define el Employee responsable y el efectivo inicial. Las operaciones automáticas serán calculadas por el Backend.
          </p>
          <Button type="button" onClick={() => setOpenDialogOpen(true)} className="mt-6 bg-red-500 text-white hover:bg-red-600">
            <Plus className="h-4 w-4" />
            Abrir caja
          </Button>
        </section>
      )}

      {openRegistersQuery.isSuccess && openRegister && (
        <>
          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Abierta
                  </span>
                  <span className="text-sm text-zinc-500">
                    Desde {formatCashDate(openRegister.open_time)}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">
                  {openRegister.employee_name ?? "Employee sin nombre disponible"}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
                  <span>
                    Saldo inicial: {formatCashMoney(
                      openRegister.opening_balance,
                      openRegister.business_currency
                    )}
                  </span>
                  {openRegister.opened_by_name && (
                    <span>Abrió: {openRegister.opened_by_name}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={() => setMovementDialogOpen(true)} className="bg-red-500 text-white hover:bg-red-600">
                  <ArrowLeftRight className="h-4 w-4" />
                  Registrar movimiento
                </Button>
                <Button type="button" variant="outline" onClick={() => void handleOpenCloseDialog()} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                  <CircleDollarSign className="h-4 w-4" />
                  Cerrar caja
                </Button>
              </div>
            </div>
          </section>

          <CashRegisterSummary
            preview={previewQuery.data}
            currency={openRegister.business_currency}
            isLoading={previewQuery.isLoading}
            isFetching={previewQuery.isFetching}
            error={previewQuery.error}
            onRefresh={() => void previewQuery.refetch()}
          />

          <CashMovementsTable
            data={movementsQuery.data}
            currency={openRegister.business_currency}
            pageSize={movementPageSize}
            onPageSizeChange={(value) => {
              setMovementPageSize(value);
              setMovementPage(1);
            }}
            onPageChange={setMovementPage}
            isLoading={movementsQuery.isLoading}
            isError={movementsQuery.isError}
            onRetry={() => void movementsQuery.refetch()}
          />
        </>
      )}

      <CashRegisterHistory
        data={historyQuery.data}
        pageSize={historyPageSize}
        onPageSizeChange={(value) => {
          setHistoryPageSize(value);
          setHistoryPage(1);
        }}
        onPageChange={setHistoryPage}
        isLoading={historyQuery.isLoading}
        isError={historyQuery.isError}
        onRetry={() => void historyQuery.refetch()}
      />

      <OpenCashRegisterDialog
        businessPublicId={businessPublicId}
        initialEmployeePublicId={
          activeMembership?.employee_public_id ?? null
        }
        open={openDialogOpen}
        onOpenChange={setOpenDialogOpen}
      />

      <CreateCashMovementDialog
        businessPublicId={businessPublicId}
        cashRegisterPublicId={openRegister?.public_id}
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
      />

      <CloseCashRegisterDialog
        businessPublicId={businessPublicId}
        cashRegister={openRegister}
        preview={previewQuery.data}
        previewLoading={previewQuery.isFetching}
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        refreshPreview={refreshPreview}
      />
    </div>
  );
}
