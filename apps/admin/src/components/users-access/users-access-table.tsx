"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Power, UsersRound } from "lucide-react";

import { canManageMembership } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import DeactivateMembershipDialog from "@/components/users-access/deactivate-membership-dialog";
import EditMembershipDialog from "@/components/users-access/edit-membership-dialog";
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

import type {
  BusinessMembershipListItem,
  NonOwnerRole,
} from "@/types/business-membership";
import type { UserRole } from "@/types/roles";

type Props = {
  memberships: BusinessMembershipListItem[];
  businessPublicId?: string;
  actorUserPublicId?: string;
  actorRole?: UserRole;
  isPlatformAdmin: boolean;
  assignableRoles: readonly NonOwnerRole[];
  onCompleted: (message: string) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function UsersAccessTable({
  memberships,
  businessPublicId,
  actorUserPublicId,
  actorRole,
  isPlatformAdmin,
  assignableRoles,
  onCompleted,
}: Props) {
  const [editingMembership, setEditingMembership] =
    useState<BusinessMembershipListItem | null>(null);
  const [deactivatingMembership, setDeactivatingMembership] =
    useState<BusinessMembershipListItem | null>(null);

  if (memberships.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <UsersRound className="h-6 w-6" />
        </div>
        <h3 className="font-medium text-white">No hay accesos</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos memberships que coincidan con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <Table stickyHeader className="min-w-[1040px]">
          <TableHeader className="border-b border-white/10 bg-white/[0.02]">
            <TableRow className="border-white/10 text-xs uppercase tracking-wider hover:bg-transparent">
              {[
                "Usuario",
                "Correo",
                "Rol local",
                "Membership",
                "Empleado vinculado",
                "Estado empleado",
                "Acceso desde",
                "Acciones",
              ].map((label) => (
                <TableHead
                  key={label}
                  className="h-auto px-5 py-4 font-medium text-zinc-500"
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {memberships.map((membership) => {
              const canManage = canManageMembership(
                actorUserPublicId,
                actorRole,
                isPlatformAdmin,
                membership
              );

              return (
                <TableRow
                  key={membership.public_id}
                  className="border-white/10 hover:bg-white/[0.025]"
                >
                <TableCell className="px-5 py-4 font-medium text-white">
                  {membership.user_full_name || "Sin nombre"}
                </TableCell>
                <TableCell className="max-w-64 truncate px-5 py-4 text-zinc-400">
                  {membership.user_email}
                </TableCell>
                <TableCell className="px-5 py-4 text-zinc-300">
                  {membership.role_display}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                      membership.is_active
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                    )}
                  >
                    {membership.is_active ? "Activa" : "Inactiva"}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4">
                  {membership.employee_name ? (
                    <div>
                      <p className="text-zinc-300">{membership.employee_name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {membership.employee_position || "Sin puesto"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Sin vínculo</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 text-zinc-400">
                  {membership.employee_status_name ?? "—"}
                </TableCell>
                <TableCell className="px-5 py-4 text-zinc-400">
                  {formatDate(membership.created_at)}
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  {canManage ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Abrir acciones de ${membership.user_full_name || membership.user_email}`}
                          className="text-zinc-500 hover:bg-white/5 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 border-white/10 bg-zinc-950 text-zinc-300">
                        <DropdownMenuLabel className="truncate text-xs text-zinc-500">
                          {membership.user_full_name || membership.user_email}
                        </DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setEditingMembership(membership)}>
                          <Pencil />Editar membership
                        </DropdownMenuItem>
                        {membership.is_active && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeactivatingMembership(membership)}>
                              <Power />Desactivar acceso
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

      <EditMembershipDialog
        membership={editingMembership}
        businessPublicId={businessPublicId}
        roles={assignableRoles}
        open={Boolean(editingMembership)}
        onOpenChange={(open) => {
          if (!open) setEditingMembership(null);
        }}
        onCompleted={onCompleted}
      />
      <DeactivateMembershipDialog
        membership={deactivatingMembership}
        businessPublicId={businessPublicId}
        open={Boolean(deactivatingMembership)}
        onOpenChange={(open) => {
          if (!open) setDeactivatingMembership(null);
        }}
        onCompleted={onCompleted}
      />
    </div>
  );
}
