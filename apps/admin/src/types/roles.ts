export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  CASHIER: "cashier",
  SELLER: "seller",
  INVENTORY: "inventory",
  VIEWER: "viewer",
} as const;

export type UserRole =
  (typeof ROLES)[keyof typeof ROLES];