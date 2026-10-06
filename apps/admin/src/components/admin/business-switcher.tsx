"use client";

import {
  Building2,
  ChevronsUpDown,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { UserRole } from "@/types/roles";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  cashier: "Cajero",
  seller: "Vendedor",
  inventory: "Inventario",
  viewer: "Consulta",
};

export function getRoleLabel(role: UserRole) {
  return ROLE_LABELS[role];
}

export default function BusinessSwitcher() {
  const {
    memberships,
    activeMembership,
    selectMembership,
  } = useAuth();

  if (!activeMembership) return null;

  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
        <Building2 className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span
          className="block truncate text-sm font-medium text-white"
          title={activeMembership.business_name}
        >
          {activeMembership.business_name}
        </span>
        <span className="block truncate text-xs font-normal text-zinc-500">
          {getRoleLabel(activeMembership.role)}
        </span>
      </span>
    </>
  );

  if (memberships.length <= 1) {
    return (
      <div
        className="flex min-w-0 max-w-56 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:max-w-72"
        aria-label={`Negocio activo: ${activeMembership.business_name}`}
      >
        {content}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-w-0 max-w-56 justify-start gap-3 border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.07] sm:max-w-72"
          aria-label={`Cambiar negocio. Actual: ${activeMembership.business_name}`}
        >
          {content}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] border-white/10 bg-zinc-950 text-white"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-zinc-500">
          Seleccionar negocio
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuRadioGroup
          value={activeMembership.membership_public_id}
          onValueChange={selectMembership}
        >
          {memberships.map((membership) => (
            <DropdownMenuRadioItem
              key={membership.membership_public_id}
              value={membership.membership_public_id}
              aria-current={
                membership.membership_public_id ===
                activeMembership.membership_public_id
                  ? "true"
                  : undefined
              }
              className="items-start py-2.5 focus:bg-white/10 focus:text-white"
            >
              <span className="min-w-0">
                <span
                  className="block truncate font-medium"
                  title={membership.business_name}
                >
                  {membership.business_name}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {getRoleLabel(membership.role)}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
