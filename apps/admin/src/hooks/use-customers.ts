"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { customerService } from "@/services/customer-service";

import type { CreateCustomerRequest } from "@/types/customer";

type UseCustomersParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  statusPublicId?: string;
};

export const customerKeys = {
  all: ["customers"] as const,

  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },

  list(params: UseCustomersParams) {
    return [
      ...this.byBusiness(params.businessPublicId),
      params.page,
      params.pageSize,
      params.search,
      params.ordering,
      params.statusPublicId,
    ] as const;
  },
};

export function useCustomers(params: UseCustomersParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () =>
      customerService.list({
        business_public_id: params.businessPublicId!,
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering,
        status_public_id: params.statusPublicId,
      }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId
        ? previousData
        : undefined,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      customerService.create(data),
    onSuccess: (_customer, variables) =>
      queryClient.invalidateQueries({
        queryKey: customerKeys.byBusiness(
          variables.business_public_id
        ),
      }),
  });
}
