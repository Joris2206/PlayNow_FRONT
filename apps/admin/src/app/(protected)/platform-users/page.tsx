"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { usePlatformUsers } from "@/hooks/use-platform-users";
import { getPlatformUserError } from "@/components/platform-users/platform-user-errors";
import PlatformUsersTable from "@/components/platform-users/platform-users-table";
import PlatformUsersToolbar, {
  type PlatformUserBooleanFilter,
} from "@/components/platform-users/platform-users-toolbar";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

import type { PlatformUserOrdering } from "@/types/platform-user";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_ORDERING: PlatformUserOrdering = "-created_at";

function toBoolean(value: PlatformUserBooleanFilter) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function PlatformUsersPage() {
  const { isLoading: isAuthLoading, isPlatformAdmin, user } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<PlatformUserOrdering>(DEFAULT_ORDERING);
  const [activity, setActivity] = useState<PlatformUserBooleanFilter>("");
  const [adminStatus, setAdminStatus] = useState<PlatformUserBooleanFilter>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleCompleted(message: string) {
    setSuccessMessage(message);
    setPage(1);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = usePlatformUsers(
    {
      page,
      page_size: pageSize,
      search: search || undefined,
      ordering,
      is_active: toBoolean(activity),
      is_superuser: toBoolean(adminStatus),
    },
    isPlatformAdmin && !isAuthLoading
  );

  if (!isAuthLoading && !isPlatformAdmin) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">Acceso no disponible</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Solo un Platform Admin activo puede consultar el directorio global.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Plataforma"
        title="Usuarios de plataforma"
        description="Administra la identidad, el estado global y las sesiones de los Users. Los accesos a cada Business se gestionan en Usuarios y accesos."
      />

      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
        El API actual no permite crear Users globales ni asignar Platform Admin desde esta sección.
      </div>

      {successMessage && (
        <div role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <PlatformUsersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        pageSize={pageSize}
        onPageSizeChange={(value) => { setPageSize(value); setPage(1); }}
        ordering={ordering}
        onOrderingChange={(value) => { setOrdering(value); setPage(1); }}
        activity={activity}
        onActivityChange={(value) => { setActivity(value); setPage(1); }}
        adminStatus={adminStatus}
        onAdminStatusChange={(value) => { setAdminStatus(value); setPage(1); }}
      />

      {(isAuthLoading || query.isLoading) && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">Cargando usuarios globales...</p>
          </div>
        </div>
      )}

      {query.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
            <h3 className="mt-4 font-medium text-white">No pudimos cargar los usuarios</h3>
            <p className="mt-2 text-sm text-zinc-400">
              {getPlatformUserError(query.error, "No fue posible cargar el directorio global.")}
            </p>
            <Button type="button" variant="outline" onClick={() => query.refetch()} className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {query.isSuccess && query.data && (
        <>
          <PlatformUsersTable users={query.data.results} currentUserPublicId={user?.public_id} onCompleted={handleCompleted} />
          <ListPagination
            count={query.data.count}
            singularLabel="usuario"
            pluralLabel="usuarios"
            currentPage={query.data.current_page}
            totalPages={query.data.total_pages}
            hasPrevious={Boolean(query.data.previous)}
            hasNext={Boolean(query.data.next)}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
