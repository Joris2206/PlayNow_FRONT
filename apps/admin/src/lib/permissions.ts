import { ROLES, type UserRole } from "@/types/roles";

const ADMIN_ACCESS_ROLES = {
  catalog: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
    ROLES.SELLER,
    ROLES.VIEWER,
  ],
  inventory: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ],
  sales: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.VIEWER,
  ],
  customers: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.SELLER,
    ROLES.VIEWER,
  ],
  suppliers: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.INVENTORY,
    ROLES.VIEWER,
  ],
  debts: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
    ROLES.VIEWER,
  ],
  cash: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.CASHIER,
  ],
  reports: [
    ROLES.OWNER,
    ROLES.ADMIN,
    ROLES.VIEWER,
  ],
} as const satisfies Record<string, readonly UserRole[]>;

export type AdminAccessPolicy =
  keyof typeof ADMIN_ACCESS_ROLES;

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
  policy?: AdminAccessPolicy
) {
  if (!policy) {
    return true;
  }

  return hasRole(
    currentRole,
    ADMIN_ACCESS_ROLES[policy]
  );
}
