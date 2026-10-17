"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Crown,
  LoaderCircle,
  Plus,
  ShieldMinus,
} from "lucide-react";

import {
  useBusinessOwners,
  useOwnershipCandidates,
} from "@/hooks/use-business-memberships";
import {
  canPromoteMembershipToOwner,
  canRemoveMembershipOwner,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

import PromoteOwnerDialog from "@/components/users-access/promote-owner-dialog";
import RemoveOwnerDialog from "@/components/users-access/remove-owner-dialog";
import TransferOwnershipDialog from "@/components/users-access/transfer-ownership-dialog";
import { Button } from "@/components/ui/button";

import type {
  BusinessMembershipListItem,
  NonOwnerRole,
} from "@/types/business-membership";

type Props = {
  businessPublicId?: string;
  businessName?: string;
  actorUserPublicId?: string;
  canManage: boolean;
  replacementRoles: readonly NonOwnerRole[];
  onCompleted: (message: string) => void;
};

const EMPTY_MEMBERSHIPS: readonly BusinessMembershipListItem[] = [];

export default function OwnershipSection({
  businessPublicId,
  businessName,
  actorUserPublicId,
  canManage,
  replacementRoles,
  onCompleted,
}: Props) {
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [removingOwner, setRemovingOwner] =
    useState<BusinessMembershipListItem | null>(null);
  const ownersQuery = useBusinessOwners(businessPublicId);
  const candidatesQuery = useOwnershipCandidates(
    businessPublicId,
    canManage
  );
  const owners = ownersQuery.data ?? EMPTY_MEMBERSHIPS;
  const candidates = candidatesQuery.data ?? EMPTY_MEMBERSHIPS;
  const promotionCandidates = useMemo(
    () =>
      candidates.filter((candidate) =>
        canPromoteMembershipToOwner(actorUserPublicId, candidate)
      ),
    [actorUserPublicId, candidates]
  );
  const activeOwners = useMemo(
    () => owners.filter((owner) => owner.is_active),
    [owners]
  );
  const transferAvailable =
    activeOwners.length > 0 && candidates.length > 1;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <Crown className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Propietarios</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Consulta todas las memberships Owner del negocio. El estado mostrado corresponde a la membership; el Backend valida también el estado global del User.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransferOpen(true)}
              disabled={candidatesQuery.isLoading || !transferAvailable}
              className="border-white/10 bg-transparent text-white"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transferir propiedad
            </Button>
            <Button
              type="button"
              onClick={() => setPromoteOpen(true)}
              disabled={candidatesQuery.isLoading || promotionCandidates.length === 0}
              className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Agregar propietario
            </Button>
          </div>
        )}
      </div>

      {ownersQuery.isLoading && (
        <div className="flex min-h-32 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      )}

      {ownersQuery.isError && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
          <p className="mt-3 text-sm text-red-300">No fue posible cargar todos los propietarios del negocio.</p>
          <Button type="button" variant="outline" onClick={() => ownersQuery.refetch()} className="mt-4 border-white/10 bg-transparent text-white">Reintentar</Button>
        </div>
      )}

      {canManage && candidatesQuery.isError && (
        <div role="alert" className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          No fue posible cargar las memberships candidatas. Las operaciones de Ownership permanecen deshabilitadas.
        </div>
      )}

      {ownersQuery.isSuccess && owners.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          No se encontraron memberships Owner. El Backend debe conservar al menos un Owner efectivo.
        </div>
      )}

      {owners.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {owners.map((owner) => {
            const canRemove =
              canManage &&
              owners.length > 1 &&
              canRemoveMembershipOwner(actorUserPublicId, owner);

            return (
              <article key={owner.public_id} className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-white">
                      {owner.user_full_name || "Sin nombre"}
                    </p>
                    <span className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                      owner.is_active
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                    )}>
                      {owner.is_active ? "Membership activa" : "Membership inactiva"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500">{owner.user_email}</p>
                  {owner.employee_name && (
                    <p className="mt-2 text-xs text-zinc-600">Employee: {owner.employee_name}</p>
                  )}
                </div>

                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemovingOwner(owner)}
                    className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <ShieldMinus className="h-4 w-4" />
                    Retirar
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <PromoteOwnerDialog
        businessPublicId={businessPublicId}
        businessName={businessName}
        candidates={promotionCandidates}
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        onCompleted={onCompleted}
      />
      <TransferOwnershipDialog
        businessPublicId={businessPublicId}
        businessName={businessName}
        owners={activeOwners}
        candidates={candidates}
        replacementRoles={replacementRoles}
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onCompleted={onCompleted}
      />
      <RemoveOwnerDialog
        businessPublicId={businessPublicId}
        owner={removingOwner}
        replacementRoles={replacementRoles}
        open={Boolean(removingOwner)}
        onOpenChange={(open) => {
          if (!open) setRemovingOwner(null);
        }}
        onCompleted={onCompleted}
      />
    </section>
  );
}
