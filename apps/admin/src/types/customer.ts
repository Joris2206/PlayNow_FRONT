import type { BusinessListQueryParams } from "@/types/api";

export type Customer = {
  public_id: string;
  business_public_id: string;
  full_name: string;
  phone: string;
  email: string;
  status_public_id: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type CustomerListParams = BusinessListQueryParams;

export type CreateCustomerRequest = {
  business_public_id: string;
  full_name: string;
  phone: string;
  email: string;
  status_public_id?: string;
};
