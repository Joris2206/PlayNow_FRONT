import type { UserRole } from "@/types/roles";

export type NonOwnerRole = Exclude<UserRole, "owner">;

export type BusinessMembershipListItem = {
  public_id: string;
  user_public_id: string;
  user_email: string;
  user_full_name: string;
  business_public_id: string;
  business_name: string;
  employee_public_id: string | null;
  employee_name: string | null;
  employee_position: string | null;
  employee_status_public_id: string | null;
  employee_status_name: string | null;
  role: UserRole;
  role_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BusinessMembershipOrdering =
  | "user_full_name"
  | "-user_full_name"
  | "user_email"
  | "-user_email"
  | "role"
  | "-role"
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at";

export type BusinessMembershipListParams = {
  business_public_id: string;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: BusinessMembershipOrdering;
  role?: UserRole;
  is_active?: boolean;
  employee_status_public_id?: string;
};

export type BusinessMembershipMutationResult = {
  public_id: string;
  user_email: string;
  business_public_id: string;
  business_name: string;
  employee_public_id: string | null;
  employee_name: string | null;
  role: UserRole;
  role_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AddExistingBusinessMemberRequest = {
  email: string;
  role: NonOwnerRole;
};

export type CreateBusinessUserRequest = {
  email: string;
  full_name: string;
  password: string;
  password_confirmation: string;
  role: NonOwnerRole;
};

export type CreateBusinessUserResponse = {
  user_public_id: string;
  email: string;
  full_name: string;
  membership_public_id: string;
  business_public_id: string;
  role: NonOwnerRole;
  is_active: boolean;
  employee_public_id: null;
  created_at: string;
  updated_at: string;
};

export type UpdateBusinessMembershipRequest = {
  role?: NonOwnerRole;
  is_active?: boolean;
};

export type PromoteBusinessOwnerRequest = {
  membership_public_id: string;
};

export type TransferBusinessOwnershipRequest = {
  from_membership_public_id: string;
  to_membership_public_id: string;
  from_role: NonOwnerRole;
};

export type TransferBusinessOwnershipResponse = {
  from_membership: BusinessMembershipMutationResult;
  to_membership: BusinessMembershipMutationResult;
};

export type RemoveBusinessOwnerRequest = {
  replacement_role: NonOwnerRole;
};
