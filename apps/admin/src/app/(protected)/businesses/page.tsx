"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle, Plus } from "lucide-react";

import { useBusinesses } from "@/hooks/use-businesses";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { useAuth } from "@/providers/auth-provider";

import BusinessActionDialog, {
  type BusinessAction,
} from "@/components/businesses/business-action-dialog";
import BusinessDetailDialog from "@/components/businesses/business-detail-dialog";
import BusinessFormDialog from "@/components/businesses/business-form-dialog";
import BusinessesTable from "@/components/businesses/businesses-table";
import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

import type { Business } from "@/types/business";

const DEFAULT_PAGE_SIZE = 20;
const BUSINESS_STATUS_NAMES = new Set(["Activo", "Inactivo", "Eliminado"]);

export default function BusinessesPage() {
  const { isPlatformAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusPublicId, setStatusPublicId] = useState("");
  const [ordering, setOrdering] = useState("business_name");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [detailBusiness, setDetailBusiness] = useState<Business | null>(null);
  const [actionBusiness, setActionBusiness] = useState<Business | null>(null);
  const [action, setAction] = useState<BusinessAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const businessesQuery = useBusinesses({
    enabled: true,
    page,
    pageSize,
    search: search || undefined,
    ordering,
    statusPublicId: statusPublicId || undefined,
  });
  const statusesQuery = useEntityStatuses();
  const businessStatuses = useMemo(
    () =>
      (statusesQuery.data?.results ?? []).filter((status) =>
        BUSINESS_STATUS_NAMES.has(status.name)
      ),
    [statusesQuery.data]
  );
  const data = businessesQuery.data;

  function openAction(business: Business, nextAction: BusinessAction) {
    setActionBusiness(business);
    setAction(nextAction);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Negocios"
        description="Consulta y administra los negocios visibles para tu cuenta. Un negocio suspendido no puede usarse como contexto operativo."
        actions={
          isPlatformAdmin ? (
            <Button type="button" onClick={() => { setEditingBusiness(null); setFormOpen(true); }} className="bg-red-500 text-white hover:bg-red-600">
              <Plus className="h-4 w-4" />Nuevo negocio
            </Button>
          ) : null
        }
      />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <span>{notice}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setNotice(null)}>Cerrar</Button>
        </div>
      )}

      <CatalogListToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar negocios..."
        searchLabel="Buscar negocios"
        pageSize={pageSize}
        onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(1); }}
        pageSizeLabel="Negocios por página"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
              <span>Estado</span>
              <select
                value={statusPublicId}
                onChange={(event) => { setStatusPublicId(event.target.value); setPage(1); }}
                disabled={statusesQuery.isLoading || statusesQuery.isError}
                aria-label="Filtrar negocios por estado"
                className="max-w-32 bg-transparent font-medium text-white outline-none"
              >
                <option value="" className="bg-zinc-950">Todos</option>
                {businessStatuses.map((status) => (
                  <option key={status.public_id} value={status.public_id} className="bg-zinc-950">
                    {status.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
              <span>Orden</span>
              <select
                value={ordering}
                onChange={(event) => { setOrdering(event.target.value); setPage(1); }}
                aria-label="Ordenar negocios"
                className="bg-transparent font-medium text-white outline-none"
              >
                <option value="business_name" className="bg-zinc-950">Nombre A–Z</option>
                <option value="-business_name" className="bg-zinc-950">Nombre Z–A</option>
              </select>
            </label>
          </div>
        }
      />

      {statusesQuery.isError && (
        <div role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          El filtro por estado no está disponible en este momento. El listado continúa funcionando.
        </div>
      )}

      {businessesQuery.isLoading && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">Cargando negocios...</p>
          </div>
        </div>
      )}

      {businessesQuery.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
          <div>
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
            <h2 className="mt-4 font-medium text-white">No pudimos cargar los negocios</h2>
            <p className="mt-2 text-sm text-zinc-500">Verifica tu conexión o permisos e intenta nuevamente.</p>
            <Button type="button" variant="outline" onClick={() => businessesQuery.refetch()} className="mt-5 border-white/10 bg-transparent text-white">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {businessesQuery.isSuccess && data && (
        <>
          <BusinessesTable
            businesses={data.results}
            onView={setDetailBusiness}
            onEdit={(business) => { setEditingBusiness(business); setFormOpen(true); }}
            onAction={openAction}
          />
          <ListPagination
            count={data.count}
            singularLabel="negocio"
            pluralLabel="negocios"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        </>
      )}

      <BusinessFormDialog
        business={editingBusiness}
        isPlatformAdmin={isPlatformAdmin}
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingBusiness(null); }}
        onSaved={(message) => { setNotice(message); setPage(1); }}
      />
      <BusinessDetailDialog
        business={detailBusiness}
        open={Boolean(detailBusiness)}
        onOpenChange={(open) => { if (!open) setDetailBusiness(null); }}
      />
      <BusinessActionDialog
        action={action}
        business={actionBusiness}
        open={Boolean(action && actionBusiness)}
        onOpenChange={(open) => { if (!open) { setAction(null); setActionBusiness(null); } }}
        onCompleted={(message) => { setNotice(message); setPage(1); }}
      />
    </div>
  );
}
