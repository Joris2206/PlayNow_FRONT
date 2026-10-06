import {
  Boxes,
  CircleDollarSign,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Tags,
  Truck,
  UserRoundCog,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import {
  hasAccess,
  type AdminAccessPolicy,
} from "@/lib/permissions";
import type { UserRole } from "@/types/roles";

export type AdminNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  access: AdminAccessPolicy;
};

export const adminNavigation: readonly AdminNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    access: "dashboard",
  },
  {
    label: "Productos",
    href: "/products",
    icon: Package,
    access: "catalog",
  },
  {
    label: "Categorías",
    href: "/categories",
    icon: Tags,
    access: "catalog",
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Boxes,
    access: "inventory",
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: ShoppingCart,
    access: "sales",
  },
  {
    label: "Compras",
    href: "/purchases",
    icon: ReceiptText,
    access: "purchases",
  },
  {
    label: "Gastos",
    href: "/expenses",
    icon: HandCoins,
    access: "expenses",
  },
  {
    label: "Clientes",
    href: "/customers",
    icon: Users,
    access: "customers",
  },
  {
    label: "Proveedores",
    href: "/suppliers",
    icon: Truck,
    access: "suppliers",
  },
  {
    label: "Empleados",
    href: "/employees",
    icon: UserRoundCog,
    access: "employees",
  },
  {
    label: "Comisiones",
    href: "/commissions",
    icon: HandCoins,
    access: "commissions",
  },
  {
    label: "Deudas",
    href: "/debts",
    icon: WalletCards,
    access: "debts",
  },
  {
    label: "Métodos de pago",
    href: "/payment-methods",
    icon: CreditCard,
    access: "payment-methods",
  },
  {
    label: "Caja",
    href: "/cash",
    icon: CircleDollarSign,
    access: "cash",
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: ReceiptText,
    access: "reports",
  },
];

export function getFirstAccessibleAdminRoute(
  role: UserRole | undefined,
  isPlatformAdmin = false
) {
  return adminNavigation.find((item) =>
    hasAccess(role, item.access, isPlatformAdmin)
  )?.href;
}
