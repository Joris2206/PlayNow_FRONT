import { ROLES, type UserRole } from "@/types/roles";

const ADMIN_ACCESS = {
  "platform-users": {
    roles: [],
    platformAdmin: true,
    platformOnly: true,
  },
  businesses: {
    roles: [],
    platformAdmin: false,
    businessAdministration: true,
  },
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
  "users-access": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  "users-access-write": { roles: [
    ROLES.OWNER,
    ROLES.ADMIN,
  ], platformAdmin: true },
  "users-access-create-user": { roles: [
    ROLES.OWNER,
  ], platformAdmin: true },
  ownership: { roles: [
    ROLES.OWNER,
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
  {
    roles: readonly UserRole[];
    platformAdmin: boolean;
    businessAdministration?: boolean;
    platformOnly?: boolean;
  }
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
  isPlatformAdmin = false,
  canAccessBusinessAdministration = false
) {
  if (!policy) {
    return true;
  }

  const access = ADMIN_ACCESS[policy];

  if ("platformOnly" in access && access.platformOnly) {
    return isPlatformAdmin;
  }

  if (
    "businessAdministration" in access &&
    access.businessAdministration
  ) {
    return canAccessBusinessAdministration;
  }

  return (
    hasRole(currentRole, access.roles) ||
    (isPlatformAdmin && access.platformAdmin)
  );
}

export type ManageableMembership = {
  user_public_id: string;
  role: UserRole;
};

export type OwnershipMembership = ManageableMembership & {
  is_active: boolean;
};

const LOWER_MEMBERSHIP_ROLES = [
  ROLES.CASHIER,
  ROLES.SELLER,
  ROLES.INVENTORY,
  ROLES.VIEWER,
] as const;

const NON_OWNER_MEMBERSHIP_ROLES = [
  ROLES.ADMIN,
  ...LOWER_MEMBERSHIP_ROLES,
] as const;

export function canManageMembership(
  actorUserPublicId: string | undefined,
  actorRole: UserRole | undefined,
  isPlatformAdmin: boolean,
  target: ManageableMembership
) {
  if (!actorUserPublicId || target.user_public_id === actorUserPublicId) {
    return false;
  }

  if (target.role === ROLES.OWNER) return false;
  if (isPlatformAdmin || actorRole === ROLES.OWNER) return true;

  return actorRole === ROLES.ADMIN && target.role !== ROLES.ADMIN;
}

export function getAssignableMembershipRoles(
  actorRole: UserRole | undefined,
  isPlatformAdmin: boolean
): readonly Exclude<UserRole, "owner">[] {
  if (isPlatformAdmin || actorRole === ROLES.OWNER) {
    return NON_OWNER_MEMBERSHIP_ROLES;
  }

  return actorRole === ROLES.ADMIN ? LOWER_MEMBERSHIP_ROLES : [];
}

export function canPromoteMembershipToOwner(
  actorUserPublicId: string | undefined,
  target: OwnershipMembership
) {
  return Boolean(
    actorUserPublicId &&
      target.user_public_id !== actorUserPublicId &&
      target.role !== ROLES.OWNER &&
      target.is_active
  );
}

export function canRemoveMembershipOwner(
  actorUserPublicId: string | undefined,
  target: OwnershipMembership
) {
  return Boolean(
    actorUserPublicId &&
      target.user_public_id !== actorUserPublicId &&
      target.role === ROLES.OWNER
  );
}
