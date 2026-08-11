"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLES, type UserRole } from "@/types/roles";

import {
  Boxes,
  CircleDollarSign,
  Gamepad2,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { hasRole } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
};

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Productos",
    href: "/products",
    icon: Package,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.INVENTORY,
      ROLES.SELLER,
      ROLES.VIEWER,
    ],
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Boxes,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.INVENTORY,
      ROLES.VIEWER,
    ],
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: ShoppingCart,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.CASHIER,
      ROLES.SELLER,
      ROLES.VIEWER,
    ],
  },
  {
    label: "Clientes",
    href: "/customers",
    icon: Users,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.CASHIER,
      ROLES.SELLER,
      ROLES.VIEWER,
    ],
  },
  {
    label: "Proveedores",
    href: "/suppliers",
    icon: Truck,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.INVENTORY,
      ROLES.VIEWER,
    ],
  },
  {
    label: "Deudas",
    href: "/debts",
    icon: WalletCards,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.CASHIER,
      ROLES.VIEWER,
    ],
  },
  {
    label: "Caja",
    href: "/cash",
    icon: CircleDollarSign,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.CASHIER,
    ],
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: ReceiptText,
    roles: [
      ROLES.OWNER,
      ROLES.ADMIN,
      ROLES.VIEWER,
    ],
  },
];

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, isLoading, activeMembership } = useAuth();
  const visibleNavigation = navigation.filter((item) =>
                hasRole(activeMembership?.role, item.roles)
              );

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-zinc-950 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 shadow-lg shadow-red-500/20">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-sm text-zinc-500">
                {isLoading
                  ? "Cargando..."
                  : activeMembership?.business_name ?? "PlayNow"}
              </p>

              <p className="text-xs text-zinc-500">
                Administration
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
            Administración
          </p>
          
          <div className="space-y-1">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                    active
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/10"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-sm font-medium text-white">
              PlayNow Admin
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Gestión centralizada del negocio.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}