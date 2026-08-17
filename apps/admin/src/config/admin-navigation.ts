import {
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type { AdminAccessPolicy } from "@/lib/permissions";

export type AdminNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  access?: AdminAccessPolicy;
};

export const adminNavigation: readonly AdminNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    label: "Deudas",
    href: "/debts",
    icon: WalletCards,
    access: "debts",
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
