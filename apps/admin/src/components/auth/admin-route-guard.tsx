"use client";

import { usePathname } from "next/navigation";

import RequirePermission from "@/components/auth/require-permission";
import { adminNavigation } from "@/config/admin-navigation";

type AdminRouteGuardProps = {
  children: React.ReactNode;
};

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const pathname = usePathname();
  const navigationItem = adminNavigation.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <RequirePermission permission={navigationItem?.access}>
      {children}
    </RequirePermission>
  );
}
