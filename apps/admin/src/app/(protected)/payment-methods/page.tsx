"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { HttpError } from "@/lib/http";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

import CreatePaymentMethodDialog from "@/components/payment-methods/create-payment-method-dialog";
import PaymentMethodsTable from "@/components/payment-methods/payment-methods-table";
import PaymentMethodsToolbar from "@/components/payment-methods/payment-methods-toolbar";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const DEFAULT_PAGE_SIZE = 20;

function listErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) {
    return "No fue posible cargar los métodos de pago.";
  }

  if (error.status === 400) {
    return "El negocio o alguno de los filtros no es válido.";
  }

  if (error.status === 403) {
    return "No tienes permisos para consultar los métodos de pago del negocio.";
  }

  return error.message;
}

export default function PaymentMethodsPage() {
  const { activeMembership, isLoading: isAuthLoading } =
    useAuth();
  const businessPublicId =
    activeMembership?.business_public_id;
  const role = activeMembership?.role;
  const canRead = hasAccess(role, "payment-methods");
  const canManage = hasAccess(
    role,
    "payment-methods-write"
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    DEFAULT_PAGE_SIZE
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusPublicId, setStatusPublicId] =
    useState("");
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchInput("");
    setSearch("");
    setStatusPublicId("");
    setCreateDialogOpen(false);
  }, [businessPublicId]);

  const statusesQuery = useEntityStatuses(
    Boolean(businessPublicId && canRead)
  );
  const paymentMethodsQuery = usePaymentMethods({
    businessPublicId:
      canRead && !isAuthLoading
        ? businessPublicId
        : undefined,
    page,
    pageSize,
    search: search || undefined,
    ordering: "name",
    statusPublicId: statusPublicId || undefined,
  });
  const data = paymentMethodsQuery.data;
  const statuses = statusesQuery.data?.results ?? [];

  if (!isAuthLoading && !canRead) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />

          <h1 className="mt-4 text-xl font-semibold text-white">
            Acceso no disponible
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Tu rol no tiene permiso para consultar métodos de pago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Métodos de pago"
        description="Administra las opciones disponibles para registrar pagos en el negocio activo."
      />

      <PaymentMethodsToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        pageSize={pageSize}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        statusPublicId={statusPublicId}
        onStatusChange={(nextStatusPublicId) => {
          setStatusPublicId(nextStatusPublicId);
          setPage(1);
        }}
        statuses={statuses}
        statusesLoading={statusesQuery.isLoading}
        canCreate={canManage && Boolean(businessPublicId)}
        onCreate={() => setCreateDialogOpen(true)}
      />

      {(isAuthLoading || paymentMethodsQuery.isLoading) && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />

            <p className="text-sm text-zinc-500">
              Cargando métodos de pago...
            </p>
          </div>
        </div>
      )}

      {paymentMethodsQuery.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />

            <h3 className="mt-4 font-medium text-white">
              No pudimos cargar los métodos de pago
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              {listErrorMessage(paymentMethodsQuery.error)}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => paymentMethodsQuery.refetch()}
              className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {paymentMethodsQuery.isSuccess && data && (
        <>
          <PaymentMethodsTable
            paymentMethods={data.results}
            businessPublicId={businessPublicId}
            canManage={canManage}
            statuses={statuses}
            statusesLoading={statusesQuery.isLoading}
            statusesError={statusesQuery.isError}
          />

          <ListPagination
            count={data.count}
            singularLabel="método"
            pluralLabel="métodos"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        </>
      )}

      {canManage && (
        <CreatePaymentMethodDialog
          businessPublicId={businessPublicId}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreated={() => setPage(1)}
        />
      )}
    </div>
  );
}
