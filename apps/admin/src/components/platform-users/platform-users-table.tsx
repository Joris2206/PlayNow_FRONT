"use client";

import { useState } from "react";
import {
  Eye,
  KeyRound,
  LogOut,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  UserRoundSearch,
} from "lucide-react";

import { cn } from "@/lib/utils";

import EditPlatformUserDialog from "@/components/platform-users/edit-platform-user-dialog";
import PlatformUserActionDialog, {
  type PlatformUserAction,
} from "@/components/platform-users/platform-user-action-dialog";
import PlatformUserDetailDialog from "@/components/platform-users/platform-user-detail-dialog";
import ResetPlatformUserPasswordDialog from "@/components/platform-users/reset-platform-user-password-dialog";
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

import type { PlatformUser } from "@/types/platform-user";

type Props = {
  users: PlatformUser[];
  currentUserPublicId?: string;
  onCompleted: (message: string) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function PlatformUsersTable({
  users,
  currentUserPublicId,
  onCompleted,
}: Props) {
  const [detailUser, setDetailUser] = useState<PlatformUser | null>(null);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<PlatformUser | null>(null);
  const [actionState, setActionState] = useState<{
    user: PlatformUser;
    action: PlatformUserAction;
  } | null>(null);

  if (users.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <UserRoundSearch className="h-6 w-6" />
        </div>
        <h3 className="font-medium text-white">No hay usuarios</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos Users globales que coincidan con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <Table stickyHeader className="min-w-[900px]">
          <TableHeader className="border-b border-white/10 bg-white/[0.02]">
            <TableRow className="border-white/10 text-xs uppercase tracking-wider hover:bg-transparent">
              {["Usuario", "Correo", "Estado global", "Tipo", "Creado", "Acciones"].map((label) => (
                <TableHead key={label} className="h-auto px-5 py-4 font-medium text-zinc-500">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.public_id === currentUserPublicId;

              return (
                <TableRow key={user.public_id} className="border-white/10 hover:bg-white/[0.025]">
                  <TableCell className="px-5 py-4 font-medium text-white">
                    {user.full_name || "Sin nombre"}
                    {isSelf && <span className="ml-2 text-xs font-normal text-zinc-500">Tú</span>}
                  </TableCell>
                  <TableCell className="max-w-72 truncate px-5 py-4 text-zinc-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                      user.is_active
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                    )}>
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-zinc-300">
                    {user.is_superuser ? "Platform Admin" : "Usuario estándar"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-zinc-400">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label={`Abrir acciones de ${user.full_name || user.email}`} className="text-zinc-500 hover:bg-white/5 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60 border-white/10 bg-zinc-950 text-zinc-300">
                        <DropdownMenuLabel className="truncate text-xs text-zinc-500">
                          {user.full_name || user.email}
                        </DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setDetailUser(user)}>
                          <Eye />Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                          <Pencil />Editar identidad
                        </DropdownMenuItem>
                        {!isSelf && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setPasswordUser(user)}>
                              <KeyRound />Restablecer contraseña
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setActionState({ user, action: "revoke-sessions" })}>
                              <LogOut />Revocar sesiones
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_active ? (
                              <DropdownMenuItem variant="destructive" onSelect={() => setActionState({ user, action: "deactivate" })}>
                                <PowerOff />Desactivar globalmente
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => setActionState({ user, action: "activate" })}>
                                <Power />Activar globalmente
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PlatformUserDetailDialog user={detailUser} open={Boolean(detailUser)} onOpenChange={(open) => { if (!open) setDetailUser(null); }} />
      <EditPlatformUserDialog user={editingUser} currentUserPublicId={currentUserPublicId} open={Boolean(editingUser)} onOpenChange={(open) => { if (!open) setEditingUser(null); }} onCompleted={onCompleted} />
      <ResetPlatformUserPasswordDialog user={passwordUser} currentUserPublicId={currentUserPublicId} open={Boolean(passwordUser)} onOpenChange={(open) => { if (!open) setPasswordUser(null); }} onCompleted={onCompleted} />
      <PlatformUserActionDialog action={actionState?.action ?? null} user={actionState?.user ?? null} currentUserPublicId={currentUserPublicId} open={Boolean(actionState)} onOpenChange={(open) => { if (!open) setActionState(null); }} onCompleted={onCompleted} />
    </div>
  );
}
