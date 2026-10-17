"use client";

import { useEffect } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import {
  adminNavigation,
  getFirstAccessibleAdminRoute,
} from "@/config/admin-navigation";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

type AdminRouteGuardProps = {
  children: React.ReactNode;
};

export default function AdminRouteGuard({
  children,
}: AdminRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPlatformAdmin, role, user } = useAuth();
  const canAccessBusinessAdministration =
    user?.can_access_business_administration === true;
  const navigationItem = adminNavigation.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
  );
  const hasCurrentRouteAccess = Boolean(
    navigationItem &&
      hasAccess(
        role ?? undefined,
        navigationItem.access,
        isPlatformAdmin,
        canAccessBusinessAdministration
      )
  );
  const fallbackRoute = getFirstAccessibleAdminRoute(
    role ?? undefined,
    isPlatformAdmin,
    canAccessBusinessAdministration
  );
  const deniedBusinessesRoute =
    navigationItem?.access === "businesses" &&
    !canAccessBusinessAdministration;
  const redirectRoute =
    fallbackRoute ?? (deniedBusinessesRoute ? "/dashboard" : undefined);

  useEffect(() => {
    if (!hasCurrentRouteAccess && redirectRoute) {
      router.replace(redirectRoute);
    }
  }, [hasCurrentRouteAccess, redirectRoute, router]);

  if (hasCurrentRouteAccess) return children;

  if (redirectRoute) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
          <p className="text-sm text-zinc-500">
            Abriendo una sección disponible...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
      <div>
        <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
        <h1 className="mt-4 text-xl font-semibold text-white">
          Acceso no disponible
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Tu rol no tiene una sección administrativa disponible.
        </p>
      </div>
    </div>
  );
}
