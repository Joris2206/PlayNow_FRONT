"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/hooks/use-products";
import { stockMovementKeys } from "@/hooks/use-stock-movements";
import { transactionService } from "@/services/transaction-service";
import type { CreatePurchaseRequest, CreateSaleRequest, TransactionType } from "@/types/transaction";

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

function invalidateTransactionEffects(queryClient: ReturnType<typeof useQueryClient>, businessPublicId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: transactionKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: productKeys.byBusiness(businessPublicId) }),
    queryClient.invalidateQueries({ queryKey: stockMovementKeys.byBusiness(businessPublicId) }),
  ]);
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleRequest) => transactionService.createSale(data),
    onSuccess: (_transaction, variables) =>
      invalidateTransactionEffects(queryClient, variables.business_public_id),
  });
}

type CancelSaleVariables = { publicId: string; businessPublicId: string };

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: CancelSaleVariables) => transactionService.cancel(publicId),
    onSuccess: (_result, variables) =>
      invalidateTransactionEffects(queryClient, variables.businessPublicId),
  });
}

export function useRefreshSaleEffects() {
  const queryClient = useQueryClient();
  return (businessPublicId: string) =>
    invalidateTransactionEffects(queryClient, businessPublicId);
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
