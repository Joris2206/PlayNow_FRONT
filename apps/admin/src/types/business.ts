import type { ListQueryParams } from "@/types/api";

export type Business = {
  public_id: string;
  business_name: string;
  description: string;
  currency: string;
  status_public_id: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type BusinessListParams = ListQueryParams & {
  status_public_id?: string;
};
