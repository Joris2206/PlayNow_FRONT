"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";

import { hasAccess, type AdminAccessPolicy } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

type RequirePermissionProps = {
  children: React.ReactNode;
  permission?: AdminAccessPolicy;
};

export default function RequirePermission({
  children,
  permission,
}: RequirePermissionProps) {
  const { activeMembership, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
          <p className="text-sm text-zinc-500">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!permission || !hasAccess(activeMembership?.role, permission)) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Acceso no disponible
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tu rol no tiene permiso para consultar esta funcionalidad.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
