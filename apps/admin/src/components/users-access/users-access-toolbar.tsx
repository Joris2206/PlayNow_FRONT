"use client";

import CatalogListToolbar from "@/components/shared/catalog-list-toolbar";

import type { BusinessMembershipOrdering } from "@/types/business-membership";
import type { EntityStatus } from "@/types/entity-status";
import type { UserRole } from "@/types/roles";

export type MembershipActivityFilter = "" | "active" | "inactive";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  ordering: BusinessMembershipOrdering;
  onOrderingChange: (value: BusinessMembershipOrdering) => void;
  role: "" | UserRole;
  onRoleChange: (value: "" | UserRole) => void;
  activity: MembershipActivityFilter;
  onActivityChange: (value: MembershipActivityFilter) => void;
  employeeStatusPublicId: string;
  onEmployeeStatusChange: (value: string) => void;
  employeeStatuses: EntityStatus[];
  employeeStatusesLoading: boolean;
};

const ORDERING_OPTIONS: ReadonlyArray<[
  BusinessMembershipOrdering,
  string,
]> = [
  ["user_full_name", "Nombre A–Z"],
  ["-user_full_name", "Nombre Z–A"],
  ["user_email", "Correo A–Z"],
  ["-user_email", "Correo Z–A"],
  ["role", "Rol A–Z"],
  ["-created_at", "Accesos recientes"],
  ["created_at", "Accesos antiguos"],
];

const ROLE_OPTIONS: ReadonlyArray<[UserRole, string]> = [
  ["owner", "Propietario"],
  ["admin", "Administrador"],
  ["cashier", "Cajero"],
  ["seller", "Vendedor"],
  ["inventory", "Inventario"],
  ["viewer", "Solo lectura"],
];

const selectClassName =
  "min-w-24 bg-transparent font-medium text-white outline-none";

export default function UsersAccessToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  ordering,
  onOrderingChange,
  role,
  onRoleChange,
  activity,
  onActivityChange,
  employeeStatusPublicId,
  onEmployeeStatusChange,
  employeeStatuses,
  employeeStatusesLoading,
}: Props) {
  return (
    <CatalogListToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por usuario o empleado..."
      searchLabel="Buscar usuarios y accesos"
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeLabel="Accesos por página"
      actions={
        <>
          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span className="whitespace-nowrap">Orden</span>
            <select
              value={ordering}
              onChange={(event) =>
                onOrderingChange(
                  event.target.value as BusinessMembershipOrdering
                )
              }
              aria-label="Ordenar accesos"
              className={selectClassName}
            >
              {ORDERING_OPTIONS.map(([value, label]) => (
                <option key={value} value={value} className="bg-zinc-950">
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span>Rol</span>
            <select
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as "" | UserRole)
              }
              aria-label="Filtrar por rol"
              className={selectClassName}
            >
              <option value="" className="bg-zinc-950">Todos</option>
              {ROLE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value} className="bg-zinc-950">
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span>Membership</span>
            <select
              value={activity}
              onChange={(event) =>
                onActivityChange(
                  event.target.value as MembershipActivityFilter
                )
              }
              aria-label="Filtrar por estado de membership"
              className={selectClassName}
            >
              <option value="" className="bg-zinc-950">Todas</option>
              <option value="active" className="bg-zinc-950">Activas</option>
              <option value="inactive" className="bg-zinc-950">Inactivas</option>
            </select>
          </label>

          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span className="whitespace-nowrap">Estado empleado</span>
            <select
              value={employeeStatusPublicId}
              onChange={(event) =>
                onEmployeeStatusChange(event.target.value)
              }
              disabled={employeeStatusesLoading}
              aria-label="Filtrar por estado del empleado"
              className={selectClassName}
            >
              <option value="" className="bg-zinc-950">Todos</option>
              {employeeStatuses.map((status) => (
                <option
                  key={status.public_id}
                  value={status.public_id}
                  className="bg-zinc-950"
                >
                  {status.name}
                </option>
              ))}
            </select>
          </label>
        </>
      }
    />
  );
}
