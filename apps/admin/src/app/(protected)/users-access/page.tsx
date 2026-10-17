"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Plus, UserPlus } from "lucide-react";

import { useBusinessMemberships } from "@/hooks/use-business-memberships";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";
import {
  getAssignableMembershipRoles,
  hasAccess,
} from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import AddExistingMemberDialog from "@/components/users-access/add-existing-member-dialog";
import CreateBusinessUserDialog from "@/components/users-access/create-business-user-dialog";
import OwnershipSection from "@/components/users-access/ownership-section";
import UsersAccessTable from "@/components/users-access/users-access-table";
import UsersAccessToolbar, {
  type MembershipActivityFilter,
} from "@/components/users-access/users-access-toolbar";

import type { BusinessMembershipOrdering } from "@/types/business-membership";
import type { UserRole } from "@/types/roles";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_ORDERING: BusinessMembershipOrdering = "user_full_name";

function membershipListErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) {
    return "No fue posible cargar los usuarios y accesos.";
  }

  if (error.status === 400) {
    return "El negocio o alguno de los filtros no es válido.";
  }

  if (error.status === 403) {
    return "No tienes permisos para consultar los accesos de este negocio.";
  }

  if (error.status === 404) {
    return "El negocio no existe, no está disponible o ya no es visible para tu cuenta.";
  }

  if (error.status === 503) {
    return "El servicio de accesos no está disponible temporalmente. Intenta nuevamente.";
  }

  return getApiErrorMessage(
    error,
    "No fue posible cargar los usuarios y accesos."
  );
}

function toActivityValue(activity: MembershipActivityFilter) {
  if (activity === "active") return true;
  if (activity === "inactive") return false;
  return undefined;
}

export default function UsersAccessPage() {
  const {
    activeBusiness,
    activeBusinessPublicId: businessPublicId,
    isLoading: isAuthLoading,
    isPlatformAdmin,
    role: activeRole,
    user,
  } = useAuth();
  const canRead = hasAccess(
    activeRole ?? undefined,
    "users-access",
    isPlatformAdmin
  );
  const canWrite = hasAccess(
    activeRole ?? undefined,
    "users-access-write",
    isPlatformAdmin
  );
  const canCreateUser = hasAccess(
    activeRole ?? undefined,
    "users-access-create-user",
    isPlatformAdmin
  );
  const canManageOwnership = hasAccess(
    activeRole ?? undefined,
    "ownership",
    isPlatformAdmin
  );
  const assignableRoles = getAssignableMembershipRoles(
    activeRole ?? undefined,
    isPlatformAdmin
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] =
    useState<BusinessMembershipOrdering>(DEFAULT_ORDERING);
  const [role, setRole] = useState<"" | UserRole>("");
  const [activity, setActivity] =
    useState<MembershipActivityFilter>("");
  const [employeeStatusPublicId, setEmployeeStatusPublicId] = useState("");
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
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

  useEffect(() => {
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchInput("");
    setSearch("");
    setOrdering(DEFAULT_ORDERING);
    setRole("");
    setActivity("");
    setEmployeeStatusPublicId("");
    setAddExistingOpen(false);
    setCreateUserOpen(false);
    setSuccessMessage(null);
  }, [businessPublicId]);

  const queryEnabled = canRead && !isAuthLoading && Boolean(businessPublicId);
  const statusesQuery = useEntityStatuses(queryEnabled);
  const membershipsQuery = useBusinessMemberships({
    businessPublicId: queryEnabled ? businessPublicId : undefined,
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering,
    role: role || undefined,
    is_active: toActivityValue(activity),
    employee_status_public_id: employeeStatusPublicId || undefined,
  });
  const data = membershipsQuery.data;

  if (!isAuthLoading && !canRead) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Acceso no disponible
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Solo propietarios y administradores pueden consultar los accesos del negocio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y accesos"
        description="Consulta quién tiene acceso al negocio activo, su rol local y el estado de su membership."
        actions={
          canWrite ? (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddExistingOpen(true)}
                className="border-white/10 bg-transparent text-white"
              >
                <UserPlus className="h-4 w-4" />
                Agregar existente
              </Button>
              {canCreateUser && (
                <Button
                  type="button"
                  onClick={() => setCreateUserOpen(true)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <Plus className="h-4 w-4" />
                  Crear usuario
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      <OwnershipSection
        businessPublicId={businessPublicId}
        businessName={activeBusiness?.name}
        actorUserPublicId={user?.public_id}
        canManage={canManageOwnership}
        replacementRoles={assignableRoles}
        onCompleted={handleCompleted}
      />

      <UsersAccessToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        pageSize={pageSize}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        ordering={ordering}
        onOrderingChange={(nextOrdering) => {
          setOrdering(nextOrdering);
          setPage(1);
        }}
        role={role}
        onRoleChange={(nextRole) => {
          setRole(nextRole);
          setPage(1);
        }}
        activity={activity}
        onActivityChange={(nextActivity) => {
          setActivity(nextActivity);
          setPage(1);
        }}
        employeeStatusPublicId={employeeStatusPublicId}
        onEmployeeStatusChange={(nextStatus) => {
          setEmployeeStatusPublicId(nextStatus);
          setPage(1);
        }}
        employeeStatuses={statusesQuery.data?.results ?? []}
        employeeStatusesLoading={statusesQuery.isLoading}
      />

      {statusesQuery.isError && (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
        >
          No fue posible cargar el filtro de estado del empleado. El resto de filtros continúa disponible.
        </div>
      )}

      {(isAuthLoading || membershipsQuery.isLoading) && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">Cargando usuarios y accesos...</p>
          </div>
        </div>
      )}

      {membershipsQuery.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
            <h3 className="mt-4 font-medium text-white">
              No pudimos cargar los accesos
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {membershipListErrorMessage(membershipsQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => membershipsQuery.refetch()}
              className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {membershipsQuery.isSuccess && data && (
        <>
          <UsersAccessTable
            memberships={data.results}
            businessPublicId={businessPublicId}
            actorUserPublicId={user?.public_id}
            actorRole={activeRole ?? undefined}
            isPlatformAdmin={isPlatformAdmin}
            assignableRoles={assignableRoles}
            onCompleted={handleCompleted}
          />
          <ListPagination
            count={data.count}
            singularLabel="acceso"
            pluralLabel="accesos"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        </>
      )}

      {canWrite && (
        <AddExistingMemberDialog
          businessPublicId={businessPublicId}
          roles={assignableRoles}
          open={addExistingOpen}
          onOpenChange={setAddExistingOpen}
          onCompleted={handleCompleted}
        />
      )}

      {canCreateUser && (
        <CreateBusinessUserDialog
          businessPublicId={businessPublicId}
          roles={assignableRoles}
          open={createUserOpen}
          onOpenChange={setCreateUserOpen}
          onCompleted={handleCompleted}
        />
      )}
    </div>
  );
}
