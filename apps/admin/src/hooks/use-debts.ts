"use client";

import { useQuery } from "@tanstack/react-query";
import { debtService } from "@/services/debt-service";
import type { TransactionType } from "@/types/transaction";

type UseDebtsParams = {
  businessPublicId?: string;
  transactionType: TransactionType;
  isSettled?: boolean;
  customerPublicId?: string;
  supplierPublicId?: string;
  transactionPublicId?: string;
  page: number;
  pageSize: number;
  ordering?: string;
};

export const debtKeys = {
  all: ["debts"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  lists(businessPublicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "list"] as const;
  },
  list(params: UseDebtsParams) {
    return [
      ...this.lists(params.businessPublicId),
      params.transactionType,
      params.isSettled,
      params.customerPublicId,
      params.supplierPublicId,
      params.transactionPublicId,
      params.page,
      params.pageSize,
      params.ordering,
    ] as const;
  },
  detail(businessPublicId: string | undefined, publicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "detail", publicId] as const;
  },
};

export function useDebts(params: UseDebtsParams) {
  return useQuery({
    queryKey: debtKeys.list(params),
    queryFn: () => debtService.list({
      business_public_id: params.businessPublicId!,
      transaction_type: params.transactionType,
      is_settled: params.isSettled,
      customer_public_id: params.customerPublicId,
      supplier_public_id: params.supplierPublicId,
      transaction_public_id: params.transactionPublicId,
      page: params.page,
      page_size: params.pageSize,
      ordering: params.ordering,
    }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId &&
      previousQuery?.queryKey[3] === params.transactionType &&
      previousQuery?.queryKey[4] === params.isSettled
        ? previousData
        : undefined,
  });
}

export function useDebt(businessPublicId?: string, publicId?: string) {
  return useQuery({
    queryKey: debtKeys.detail(businessPublicId, publicId),
    queryFn: () => debtService.get(publicId!),
    enabled: Boolean(businessPublicId && publicId),
  });
}
