"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cashMovementKeys, cashRegisterKeys } from "@/hooks/cash-query-keys";
import { commissionKeys } from "@/hooks/commission-query-keys";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { debtKeys } from "@/hooks/use-debts";
import { productKeys } from "@/hooks/use-products";
import { reportKeys } from "@/hooks/use-reports";
import { stockMovementKeys } from "@/hooks/use-stock-movements";
import { transactionService } from "@/services/transaction-service";
import type { CreateExpenseRequest, CreatePurchaseRequest, CreateSaleRequest, TransactionType } from "@/types/transaction";

type UseTransactionsParams = {
  businessPublicId?: string;
  type: TransactionType;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  statusPublicId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const transactionKeys = {
  all: ["transactions"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  list(params: UseTransactionsParams) {
    return [
      ...this.byBusiness(params.businessPublicId), params.type, params.page,
      params.pageSize, params.search, params.ordering, params.statusPublicId,
      params.dateFrom, params.dateTo,
    ] as const;
  },
};

export function useTransactions(params: UseTransactionsParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionService.list({
      business_public_id: params.businessPublicId!,
      type: params.type,
      page: params.page,
      page_size: params.pageSize,
      search: params.search,
      ordering: params.ordering,
      status_public_id: params.statusPublicId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId ? previousData : undefined,
  });
}

function invalidateTransactionEffects(
  queryClient: ReturnType<typeof useQueryClient>,
  businessPublicId: string,
  includeCommissionPreview = false
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: transactionKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: productKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: stockMovementKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: debtKeys.lists(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: cashMovementKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: cashRegisterKeys.previews(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.paymentsScope(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.debtsScope(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.monthlyScope(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.inventoryScope(businessPublicId) }),
    ...(includeCommissionPreview
      ? [
          queryClient.invalidateQueries({
            queryKey: commissionKeys.previews(businessPublicId),
          }),
        ]
      : []),
  ]);
}

function invalidateExpenseEffects(queryClient: ReturnType<typeof useQueryClient>, businessPublicId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: transactionKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: cashMovementKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: cashRegisterKeys.previews(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.paymentsScope(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: reportKeys.monthlyScope(businessPublicId) }),
  ]);
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleRequest) => transactionService.createSale(data),
    onSuccess: (_transaction, variables) =>
      invalidateTransactionEffects(
        queryClient,
        variables.business_public_id,
        true
      ),
  });
}

type CancelSaleVariables = { publicId: string; businessPublicId: string };

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: CancelSaleVariables) => transactionService.cancel(publicId),
    onSuccess: (_result, variables) =>
      invalidateTransactionEffects(
        queryClient,
        variables.businessPublicId,
        true
      ),
  });
}

export function useRefreshSaleEffects() {
  const queryClient = useQueryClient();
  return (businessPublicId: string) =>
    invalidateTransactionEffects(queryClient, businessPublicId, true);
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseRequest) => transactionService.createPurchase(data),
    onSuccess: (_transaction, variables) =>
      invalidateTransactionEffects(queryClient, variables.business_public_id),
  });
}

type CancelPurchaseVariables = { publicId: string; businessPublicId: string };

export function useCancelPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: CancelPurchaseVariables) => transactionService.cancel(publicId),
    onSuccess: (_result, variables) =>
      invalidateTransactionEffects(queryClient, variables.businessPublicId),
  });
}

export function useRefreshPurchaseEffects() {
  const queryClient = useQueryClient();
  return (businessPublicId: string) =>
    invalidateTransactionEffects(queryClient, businessPublicId);
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) =>
      transactionService.createExpense(data),
    onSuccess: (_transaction, variables) =>
      invalidateExpenseEffects(
        queryClient,
        variables.business_public_id
      ),
  });
}

type CancelExpenseVariables = {
  publicId: string;
  businessPublicId: string;
};

export function useCancelExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }: CancelExpenseVariables) =>
      transactionService.cancel(publicId),
    onSuccess: (_result, variables) =>
      invalidateExpenseEffects(
        queryClient,
        variables.businessPublicId
      ),
  });
}

export function useRefreshExpenseEffects() {
  const queryClient = useQueryClient();

  return (businessPublicId: string) =>
    invalidateExpenseEffects(queryClient, businessPublicId);
}
