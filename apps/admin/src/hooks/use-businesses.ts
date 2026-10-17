"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authQueryKeys } from "@/lib/auth-query-keys";
import { HttpError } from "@/lib/http";
import { businessService } from "@/services/business-service";

import {
  isBusinessCapabilities,
  type BusinessMutationResponse,
  type CreateBusinessRequest,
  type UpdateBusinessRequest,
} from "@/types/business";

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

export function useBusiness(publicId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: businessKeys.detail(publicId),
    queryFn: () => businessService.get(publicId!),
    enabled: Boolean(publicId) && enabled,
    retry: false,
    refetchOnMount: "always",
  });
}

async function refreshBusinessContext(
  queryClient: ReturnType<typeof useQueryClient>,
  publicId?: string
) {
  if (publicId) {
    const isOperationalQuery = (query: {
      queryKey: readonly unknown[];
    }) =>
      query.queryKey[0] !== businessKeys.all[0] &&
      query.queryKey.includes(publicId);

    await queryClient.cancelQueries({ predicate: isOperationalQuery });
    queryClient.removeQueries({ predicate: isOperationalQuery });
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: businessKeys.all }),
    queryClient.invalidateQueries({
      queryKey: authQueryKeys.me,
      refetchType: "active",
    }),
  ]);
}

function cacheCompleteBusiness(
  queryClient: ReturnType<typeof useQueryClient>,
  business: BusinessMutationResponse
) {
  if (!isBusinessCapabilities(business.capabilities)) return;

  queryClient.setQueryData(
    businessKeys.detail(business.public_id),
    { ...business, capabilities: business.capabilities }
  );
}

function refreshCapabilitiesAfterConflict(
  queryClient: ReturnType<typeof useQueryClient>,
  error: unknown,
  publicId: string
) {
  if (
    !(error instanceof HttpError) ||
    ![403, 404, 409].includes(error.status)
  ) {
    return;
  }

  const invalidations = [
    queryClient.invalidateQueries({ queryKey: businessKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: businessKeys.detail(publicId),
      exact: true,
    }),
  ];

  if ([403, 404].includes(error.status)) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.me,
        refetchType: "active",
      })
    );
  }

  return Promise.all(invalidations);
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBusinessRequest) =>
      businessService.create(data),
    onSuccess: (business) => {
      cacheCompleteBusiness(queryClient, business);
      return refreshBusinessContext(queryClient);
    },
  });
}

type UpdateBusinessVariables = {
  publicId: string;
  data: UpdateBusinessRequest;
};

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: UpdateBusinessVariables) =>
      businessService.update(publicId, data),
    onSuccess: (business) => {
      cacheCompleteBusiness(queryClient, business);
      return refreshBusinessContext(queryClient);
    },
    onError: (error, variables) =>
      refreshCapabilitiesAfterConflict(
        queryClient,
        error,
        variables.publicId
      ),
  });
}

export function useSuspendBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => businessService.suspend(publicId),
    onSuccess: (_business, publicId) =>
      refreshBusinessContext(queryClient, publicId),
    onError: (error, publicId) =>
      refreshCapabilitiesAfterConflict(queryClient, error, publicId),
  });
}

export function useReactivateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => businessService.reactivate(publicId),
    onSuccess: (_business, publicId) =>
      refreshBusinessContext(queryClient, publicId),
    onError: (error, publicId) =>
      refreshCapabilitiesAfterConflict(queryClient, error, publicId),
  });
}

export function useArchiveBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => businessService.archive(publicId),
    onSuccess: (_result, publicId) =>
      refreshBusinessContext(queryClient, publicId),
    onError: (error, publicId) =>
      refreshCapabilitiesAfterConflict(queryClient, error, publicId),
  });
}
