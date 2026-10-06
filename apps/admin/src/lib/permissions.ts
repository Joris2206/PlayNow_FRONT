import { ROLES, type UserRole } from "@/types/roles";

const ADMIN_ACCESS = {
  catalog: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
    ROLES.SELLER,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "catalog-edit": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
  ], platformAdmin: true },
  "catalog-delete": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  inventory: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "inventory-adjust": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
  ], platformAdmin: true },
  sales: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "sales-create": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
  ], platformAdmin: true },
  "sales-cancel": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  purchases: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "purchases-create": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
  ], platformAdmin: true },
  "purchases-cancel": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  expenses: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "expenses-create": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  "expenses-cancel": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  "payment-methods": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "payment-methods-write": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  employees: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  "employees-write": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  customers: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "customers-create": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
  ], platformAdmin: true },
  suppliers: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "suppliers-create": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
  ], platformAdmin: true },
  debts: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.VIEWER,
  ], platformAdmin: true },
  "debts-pay": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
  ], platformAdmin: true },
  cash: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
  ], platformAdmin: true },
  dashboard: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.VIEWER,
  ], platformAdmin: true },
  reports: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
  ], platformAdmin: true },
  "reports-financial": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  "reports-inventory": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
  ], platformAdmin: true },
  commissions: { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
} as const satisfies Record<
  string,
  { roles: readonly UserRole[]; platformAdmin: boolean }
>;

export type AdminAccessPolicy =
  keyof typeof ADMIN_ACCESS;

export function hasRole(
  currentRole: UserRole | undefined,
  allowedRoles?: readonly UserRole[]
) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!currentRole) {
    return false;
  }

  return allowedRoles.includes(currentRole);
}

export function hasAccess(
  currentRole: UserRole | undefined,
  policy?: AdminAccessPolicy,
  isPlatformAdmin = false
) {
  if (!policy) {
    return true;
  }

  const access = ADMIN_ACCESS[policy];

  return (
    hasRole(currentRole, access.roles) ||
    (isPlatformAdmin && access.platformAdmin)
  );
}
