"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import type { PlatformUserOrdering } from "@/types/platform-user";

export type PlatformUserBooleanFilter = "" | "true" | "false";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  ordering: PlatformUserOrdering;
  onOrderingChange: (value: PlatformUserOrdering) => void;
  activity: PlatformUserBooleanFilter;
  onActivityChange: (value: PlatformUserBooleanFilter) => void;
  adminStatus: PlatformUserBooleanFilter;
  onAdminStatusChange: (value: PlatformUserBooleanFilter) => void;
};

const selectClassName =
  "h-10 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-red-500/50";

export default function PlatformUsersToolbar({
  search,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  ordering,
  onOrderingChange,
  activity,
  onActivityChange,
  adminStatus,
  onAdminStatusChange,
}: Props) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_repeat(4,auto)]">
      <label className="relative">
        <span className="sr-only">Buscar usuarios</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre o correo"
          className="h-10 border-white/10 bg-zinc-950 pl-9 text-white"
        />
      </label>

      <select
        aria-label="Filtrar por estado global"
        value={activity}
        onChange={(event) =>
          onActivityChange(event.target.value as PlatformUserBooleanFilter)
        }
        className={selectClassName}
      >
        <option value="">Todos los estados</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>

      <select
        aria-label="Filtrar por administración de plataforma"
        value={adminStatus}
        onChange={(event) =>
          onAdminStatusChange(event.target.value as PlatformUserBooleanFilter)
        }
        className={selectClassName}
      >
        <option value="">Todos los tipos</option>
        <option value="true">Platform Admin</option>
        <option value="false">Usuario estándar</option>
      </select>

      <select
        aria-label="Ordenar usuarios"
        value={ordering}
        onChange={(event) =>
          onOrderingChange(event.target.value as PlatformUserOrdering)
        }
        className={selectClassName}
      >
        <option value="-created_at">Más recientes</option>
        <option value="created_at">Más antiguos</option>
        <option value="full_name">Nombre A–Z</option>
        <option value="-full_name">Nombre Z–A</option>
        <option value="email">Correo A–Z</option>
        <option value="-email">Correo Z–A</option>
        <option value="-updated_at">Actualizados recientemente</option>
      </select>

      <select
        aria-label="Usuarios por página"
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        className={selectClassName}
      >
        {[20, 50, 100, 200].map((size) => (
          <option key={size} value={size}>
            {size} por página
          </option>
        ))}
      </select>
    </div>
  );
}
