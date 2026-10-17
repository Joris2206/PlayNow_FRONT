import type { ListQueryParams } from "@/types/api";

export interface BusinessCapabilities {
  can_edit: boolean;
  can_suspend: boolean;
  can_reactivate: boolean;
  can_archive: boolean;
}

export function isBusinessCapabilities(
  value: unknown
): value is BusinessCapabilities {
  if (typeof value !== "object" || value === null) return false;

  const capabilities = value as Record<string, unknown>;

  return (
    typeof capabilities.can_edit === "boolean" &&
    typeof capabilities.can_suspend === "boolean" &&
    typeof capabilities.can_reactivate === "boolean" &&
    typeof capabilities.can_archive === "boolean"
  );
}

export type Business = {
  public_id: string;
  business_name: string;
  description: string;
  currency: string;
  status_public_id: string;
  status_name: string;
  capabilities: BusinessCapabilities;
  created_at: string;
  updated_at: string;
};

export type BusinessTransitionResponse = Omit<
  Business,
  "capabilities"
> & {
  capabilities?: BusinessCapabilities;
};

export type BusinessMutationResponse = BusinessTransitionResponse;

export type BusinessListParams = ListQueryParams & {
  status_public_id?: string;
};

export type CreateBusinessRequest = {
  business_name: string;
  description?: string;
  currency: string;
  initial_owner_email: string;
};

export type UpdateBusinessRequest = {
  business_name?: string;
  description?: string;
  currency?: string;
};

export function isBusinessOperational(business: Business) {
  return business.status_name === "Activo";
}
