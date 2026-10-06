"use client";

import { Fragment } from "react";
import {
  Building2,
  LoaderCircle,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth-service";

import { getRoleLabel } from "@/components/admin/business-switcher";
import { Button } from "@/components/ui/button";

type BusinessAccessBoundaryProps = {
  children: React.ReactNode;
};

export default function BusinessAccessBoundary({
  children,
}: BusinessAccessBoundaryProps) {
  const {
    memberships,
    activeBusinessPublicId,
    businessStatus,
    selectMembership,
  } = useAuth();

  if (businessStatus === "resolving") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-sm text-zinc-400">
            Preparando tu negocio...
          </p>
        </div>
      </div>
    );
  }

  if (businessStatus === "empty") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Building2 className="mx-auto h-9 w-9 text-zinc-600" />
          <h1 className="mt-5 text-xl font-semibold">
            No tienes negocios disponibles
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Tu cuenta no tiene memberships habilitadas para acceder al panel administrativo.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void authService.logout()}
            className="mt-6 border-white/10 bg-transparent text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  if (businessStatus === "selection-required") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-8 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <Building2 className="mx-auto h-9 w-9 text-red-400" />
            <h1 className="mt-5 text-xl font-semibold">
              Selecciona un negocio
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Elige la membership con la que deseas trabajar. Esta selección define también tu rol y empleado activo.
            </p>
          </div>

          <div
            className="mt-6 max-h-[50vh] space-y-2 overflow-y-auto pr-1"
            role="list"
            aria-label="Negocios disponibles"
          >
            {memberships.map((membership) => (
              <div
                key={membership.membership_public_id}
                role="listitem"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    selectMembership(
                      membership.membership_public_id
                    )
                  }
                  className="h-auto w-full justify-start border border-white/10 bg-black/20 px-4 py-3 text-left hover:bg-white/[0.07]"
                >
                  <Building2 className="h-5 w-5 shrink-0 text-red-400" />
                  <span className="min-w-0">
                    <span
                      className="block truncate font-medium text-white"
                      title={membership.business_name}
                    >
                      {membership.business_name}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-zinc-500">
                      {getRoleLabel(membership.role)}
                    </span>
                  </span>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => void authService.logout()}
              className="text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeBusinessPublicId) return null;

  return (
    <Fragment key={activeBusinessPublicId}>
      {children}
    </Fragment>
  );
}
