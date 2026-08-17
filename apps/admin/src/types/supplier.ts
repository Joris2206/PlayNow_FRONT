import type { BusinessListQueryParams } from "@/types/api";

export type Supplier = {
  public_id: string;
  business_public_id: string;
  name: string;
  phone: string;
  email: string;
  status_public_id: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type SupplierListParams = BusinessListQueryParams;

export type CreateSupplierRequest = {
  business_public_id: string;
  name: string;
  phone: string;
  email?: string;
  status_public_id?: string;
};
