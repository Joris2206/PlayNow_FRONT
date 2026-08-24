"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cashMovementKeys,
  cashRegisterKeys,
  type CashRegisterKeyParams,
} from "@/hooks/cash-query-keys";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { reportKeys } from "@/hooks/use-reports";
import { cashRegisterService } from "@/services/cash-register-service";

import type {
  CloseCashRegisterRequest,
  OpenCashRegisterRequest,
} from "@/types/cash";

export { cashRegisterKeys } from "@/hooks/cash-query-keys";

export function useCashRegisters(
  params: CashRegisterKeyParams
) {
  return useQuery({
    queryKey: cashRegisterKeys.list(params),
    queryFn: () =>
      cashRegisterService.list({
        business_public_id: params.businessPublicId!,
        status: params.status,
        employee_public_id: params.employeePublicId,
        page: params.page,
        page_size: params.pageSize,
        ordering: params.ordering,
      }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] ===
      params.businessPublicId
        ? previousData
        : undefined,
  });
}

export function useCashRegister(
  businessPublicId?: string,
  publicId?: string
) {
  return useQuery({
    queryKey: cashRegisterKeys.detail(
      businessPublicId,
      publicId
    ),
    queryFn: () => cashRegisterService.get(publicId!),
    enabled: Boolean(businessPublicId && publicId),
  });
}

export function useCashRegisterPreview(
  businessPublicId?: string,
  publicId?: string
) {
  return useQuery({
    queryKey: cashRegisterKeys.preview(
      businessPublicId,
      publicId
    ),
    queryFn: () =>
      cashRegisterService.closingPreview(publicId!),
    enabled: Boolean(businessPublicId && publicId),
    refetchOnWindowFocus: true,
  });
}

export function useOpenCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpenCashRegisterRequest) =>
      cashRegisterService.open(data),
    retry: false,
    onSuccess: (_cashRegister, variables) => Promise.all([
      queryClient.invalidateQueries({
        queryKey: cashRegisterKeys.lists(variables.business_public_id),
      }),
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.byBusiness(variables.business_public_id),
      }),
    ]),
  });
}

type CloseCashRegisterVariables = {
  businessPublicId: string;
  publicId: string;
  data: CloseCashRegisterRequest;
};

export function useCloseCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
      data,
    }: CloseCashRegisterVariables) =>
      cashRegisterService.close(publicId, data),
    retry: false,
    onSuccess: async (cashRegister, variables) => {
      queryClient.setQueryData(
        cashRegisterKeys.detail(
          variables.businessPublicId,
          variables.publicId
        ),
        cashRegister
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cashRegisterKeys.lists(
            variables.businessPublicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: cashMovementKeys.byRegister(
            variables.businessPublicId,
            variables.publicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.byBusiness(variables.businessPublicId),
        }),
        queryClient.invalidateQueries({
          queryKey: reportKeys.monthlyScope(variables.businessPublicId),
        }),
      ]);

      queryClient.removeQueries({
        queryKey: cashRegisterKeys.preview(
          variables.businessPublicId,
          variables.publicId
        ),
        exact: true,
      });
    },
  });
}
