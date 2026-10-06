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
  const { isPlatformAdmin, role } = useAuth();
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
        isPlatformAdmin
      )
  );
  const fallbackRoute = getFirstAccessibleAdminRoute(
    role ?? undefined,
    isPlatformAdmin
  );

  useEffect(() => {
    if (!hasCurrentRouteAccess && fallbackRoute) {
      router.replace(fallbackRoute);
    }
  }, [fallbackRoute, hasCurrentRouteAccess, router]);

  if (hasCurrentRouteAccess) return children;

  if (fallbackRoute) {
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
