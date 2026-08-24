"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cashRegisterKeys } from "@/hooks/cash-query-keys";
import { reportKeys } from "@/hooks/use-reports";
import { paymentMethodService } from "@/services/payment-method-service";

import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method";

type UsePaymentMethodsParams = {
  businessPublicId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  statusPublicId?: string;
};

export const paymentMethodKeys = {
  all: ["payment-methods"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  list(params: UsePaymentMethodsParams) {
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

export function usePaymentMethods(params: UsePaymentMethodsParams) {
  return useQuery({
    queryKey: paymentMethodKeys.list(params),
    queryFn: () => paymentMethodService.list({
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

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentMethodRequest) =>
      paymentMethodService.create(data),
    onSuccess: (_paymentMethod, variables) =>
      queryClient.invalidateQueries({
        queryKey: paymentMethodKeys.byBusiness(
          variables.business_public_id
        ),
      }),
  });
}

type UpdatePaymentMethodVariables = {
  publicId: string;
  businessPublicId: string;
  data: UpdatePaymentMethodRequest;
};

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
      data,
    }: UpdatePaymentMethodVariables) =>
      paymentMethodService.update(publicId, data),
    onSuccess: (_paymentMethod, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentMethodKeys.byBusiness(
            variables.businessPublicId
          ),
        }),
        ...(variables.data.method_type !== undefined
          ? [
              queryClient.invalidateQueries({
                queryKey: cashRegisterKeys.previews(
                  variables.businessPublicId
                ),
              }),
              queryClient.invalidateQueries({
                queryKey: reportKeys.paymentsScope(
                  variables.businessPublicId
                ),
              }),
            ]
          : []),
      ]),
  });
}

type DeletePaymentMethodVariables = {
  publicId: string;
  businessPublicId: string;
};

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }: DeletePaymentMethodVariables) =>
      paymentMethodService.delete(publicId),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: paymentMethodKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
  });
}
