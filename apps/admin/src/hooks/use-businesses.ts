"use client";

import { useQuery } from "@tanstack/react-query";

import { businessService } from "@/services/business-service";

type UseBusinessesParams = {
  enabled: boolean;
  page: number;
  pageSize: number;
  search?: string;
  ordering: string;
  statusPublicId?: string;
};

export const businessKeys = {
  all: ["businesses"] as const,
  lists: () => [...businessKeys.all, "list"] as const,
  list(params: Omit<UseBusinessesParams, "enabled">) {
    return [
      ...businessKeys.lists(),
      params.page,
      params.pageSize,
      params.search,
      params.ordering,
      params.statusPublicId,
    ] as const;
  },
  details: () => [...businessKeys.all, "detail"] as const,
  detail(publicId: string | undefined) {
    return [...businessKeys.details(), publicId] as const;
  },
};

export function useBusinesses(params: UseBusinessesParams) {
  return useQuery({
    queryKey: businessKeys.list(params),
    queryFn: () =>
      businessService.list({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering,
        status_public_id: params.statusPublicId,
    }),
    enabled: params.enabled,
  });
}
