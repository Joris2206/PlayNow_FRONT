import type { ListQueryParams } from "@/types/api";

export type EmployeeOption = {
  public_id: string;
  full_name: string;
  position: string;
};

export type EmployeeListParams = ListQueryParams & {
  business_public_id: string;
};
