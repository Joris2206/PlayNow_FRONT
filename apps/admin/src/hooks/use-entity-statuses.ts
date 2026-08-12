"use client";

import { useQuery } from "@tanstack/react-query";

import { statusService } from "@/services/status-service";

export const entityStatusKeys = {
  all: ["entity-statuses"] as const,
};

export function useEntityStatuses(
  enabled = true
) {
  return useQuery({
    queryKey: entityStatusKeys.all,
    queryFn: statusService.list,
    enabled,
    staleTime: Infinity,
  });
}
