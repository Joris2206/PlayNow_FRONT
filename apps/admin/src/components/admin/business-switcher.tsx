"use client";

import { useState } from "react";
import { Building2, ChevronsUpDown } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

import PlatformBusinessSelector from "@/components/admin/platform-business-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    activeContext,
    activeMembership,
    isPlatformAdmin,
    memberships,
    selectMembership,
  } = useAuth();
  const [platformSelectorOpen, setPlatformSelectorOpen] =
    useState(false);

  if (!activeContext) return null;

  const contextualLabel = activeMembership
    ? getRoleLabel(activeMembership.role)
    : "Administrador de plataforma";
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
        <Building2 className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span
          className="block truncate text-sm font-medium text-white"
          title={activeContext.business_name}
        >
          {activeContext.business_name}
        </span>
        <span className="block truncate text-xs font-normal text-zinc-500">
          {contextualLabel}
        </span>
      </span>
    </>
  );

  if (isPlatformAdmin) {
    return (
      <Dialog
        open={platformSelectorOpen}
        onOpenChange={setPlatformSelectorOpen}
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto min-w-0 max-w-56 justify-start gap-3 border border-white/10 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.07] sm:max-w-72"
            aria-label={`Cambiar negocio global. Actual: ${activeContext.business_name}`}
          >
            {content}
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-500" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleccionar negocio</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Administrador de plataforma · busca y selecciona un negocio sin asumir una membership.
            </DialogDescription>
          </DialogHeader>
          <PlatformBusinessSelector
            onSelected={() => setPlatformSelectorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (memberships.length <= 1 || !activeMembership) {
    return (
      <div
        className="flex min-w-0 max-w-56 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:max-w-72"
        aria-label={`Negocio activo: ${activeContext.business_name}`}
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
          aria-label={`Cambiar negocio. Actual: ${activeContext.business_name}`}
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
