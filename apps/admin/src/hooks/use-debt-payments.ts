"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cashRegisterKeys } from "@/hooks/cash-query-keys";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { debtKeys } from "@/hooks/use-debts";
import { reportKeys } from "@/hooks/use-reports";
import { transactionKeys } from "@/hooks/use-transactions";
import { debtService } from "@/services/debt-service";
import type { CreateDebtPaymentRequest } from "@/types/debt";

type UseDebtPaymentsParams = {
  businessPublicId?: string;
  debtPublicId?: string;
  page: number;
  pageSize: number;
};

export const debtPaymentKeys = {
  all: ["debt-payments"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  byDebt(businessPublicId: string | undefined, debtPublicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "debt", debtPublicId] as const;
  },
  list(params: UseDebtPaymentsParams) {
    return [
      ...this.byDebt(params.businessPublicId, params.debtPublicId),
      params.page,
      params.pageSize,
    ] as const;
  },
};

export function useDebtPayments(params: UseDebtPaymentsParams) {
  return useQuery({
    queryKey: debtPaymentKeys.list(params),
    queryFn: () => debtService.listPayments({
      business_public_id: params.businessPublicId!,
      debt_public_id: params.debtPublicId!,
      page: params.page,
      page_size: params.pageSize,
    }),
    enabled: Boolean(params.businessPublicId && params.debtPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId &&
      previousQuery?.queryKey[3] === params.debtPublicId
        ? previousData
        : undefined,
  });
}

type CreateDebtPaymentVariables = {
  businessPublicId: string;
  debtPublicId: string;
  data: CreateDebtPaymentRequest;
};

function invalidateDebtPaymentEffects(
  queryClient: ReturnType<typeof useQueryClient>,
  businessPublicId: string,
  debtPublicId: string
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: debtKeys.lists(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: debtKeys.detail(businessPublicId, debtPublicId) }),
    queryClient.invalidateQueries({ queryKey: debtPaymentKeys.byDebt(businessPublicId, debtPublicId) }),
    queryClient.invalidateQueries({ queryKey: transactionKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: cashRegisterKeys.previews(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.paymentsScope(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.debtsScope(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.monthlyScope(businessPublicId) }),
  ]);
}

export function useCreateDebtPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: CreateDebtPaymentVariables) => debtService.createPayment(data),
    retry: false,
    onSuccess: (_payment, variables) => invalidateDebtPaymentEffects(
      queryClient,
      variables.businessPublicId,
      variables.debtPublicId
    ),
  });
}

export function useRefreshDebtPaymentEffects() {
  const queryClient = useQueryClient();
  return (businessPublicId: string, debtPublicId: string) =>
    invalidateDebtPaymentEffects(queryClient, businessPublicId, debtPublicId);
}
