import type { UserRole } from "@/types/roles";

export type BusinessMembership = {
  membership_public_id: string;
  business_public_id: string;
  business_name: string;
  role: UserRole;
  employee_public_id: string | null;
};

export type AuthUser = {
  public_id: string;
  email: string;
  full_name: string;
  memberships: BusinessMembership[];
};
