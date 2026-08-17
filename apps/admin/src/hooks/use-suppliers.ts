"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "@/services/supplier-service";
import type { CreateSupplierRequest } from "@/types/supplier";

type UseSuppliersParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  statusPublicId?: string;
};

export const supplierKeys = {
  all: ["suppliers"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  list(params: UseSuppliersParams) {
    return [...this.byBusiness(params.businessPublicId), params.page, params.pageSize, params.search, params.ordering, params.statusPublicId] as const;
  },
};

export function useSuppliers(params: UseSuppliersParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => supplierService.list({
      business_public_id: params.businessPublicId!,
      page: params.page,
      page_size: params.pageSize,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.statusPublicId,
    }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId ? previousData : undefined,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => supplierService.create(data),
    onSuccess: (_supplier, variables) => queryClient.invalidateQueries({
      queryKey: supplierKeys.byBusiness(variables.business_public_id),
    }),
  });
}
