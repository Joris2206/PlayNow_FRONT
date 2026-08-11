import { ROLES, type UserRole } from "@/types/roles";

export function hasRole(
  currentRole: UserRole | undefined,
  allowedRoles?: UserRole[]
) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!currentRole) {
    return false;
  }

  return allowedRoles.includes(currentRole);
}

export const ALL_ROLES: UserRole[] = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.CASHIER,
  ROLES.SELLER,
  ROLES.INVENTORY,
  ROLES.VIEWER,
];