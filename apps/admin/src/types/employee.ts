import type { BusinessListQueryParams } from "@/types/api";

export type Employee = {
  public_id: string;
  business_public_id: string;
  full_name: string;
  phone: string;
  email: string;
  position: string;
  status_public_id: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type EmployeeOption = {
  public_id: string;
  full_name: string;
  position: string;
};

export type EmployeeOrdering =
  | "full_name"
  | "-full_name"
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at";

export type EmployeeListParams = Omit<BusinessListQueryParams, "ordering"> & {
  ordering?: EmployeeOrdering;
};

export type CreateEmployeeRequest = {
  business_public_id: string;
  full_name: string;
  position: string;
  phone?: string;
  email?: string;
  status_public_id?: string;
};

export type UpdateEmployeeRequest = {
  full_name?: string;
  position?: string;
  phone?: string;
  email?: string;
  status_public_id?: string;
};
