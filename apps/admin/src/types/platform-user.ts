import type { ListQueryParams } from "@/types/api";

export type PlatformUser = {
  public_id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
};

export type PlatformUserOrdering =
  | "email"
  | "-email"
  | "full_name"
  | "-full_name"
  | "is_active"
  | "-is_active"
  | "is_superuser"
  | "-is_superuser"
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at";

export type PlatformUserListParams = Omit<ListQueryParams, "ordering"> & {
  ordering?: PlatformUserOrdering;
  is_active?: boolean;
  is_superuser?: boolean;
};

export type UpdatePlatformUserRequest = {
  email?: string;
  full_name?: string;
};

export type ResetPlatformUserPasswordRequest = {
  password: string;
  password_confirmation: string;
};
