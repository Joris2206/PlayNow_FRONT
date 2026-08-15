"use client";

import { useQuery } from "@tanstack/react-query";

import { stockMovementService } from "@/services/stock-movement-service";

type UseStockMovementsParams = {
  businessPublicId?: string;
  productPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
};

export const stockMovementKeys = {
  all: ["stock-movements"] as const,

  byBusiness(businessPublicId: string | undefined) {
    return [
      ...this.all,
      businessPublicId,
    ] as const;
  },

  list({
    businessPublicId,
    productPublicId,
    page,
    pageSize,
    search,
    ordering,
  }: UseStockMovementsParams) {
    return [
      ...this.byBusiness(businessPublicId),
      productPublicId,
      page,
      pageSize,
      search,
      ordering,
    ] as const;
  },
};

export function useStockMovements(
  params: UseStockMovementsParams
) {
  const {
    businessPublicId,
    productPublicId,
    page,
    pageSize,
    search,
    ordering,
  } = params;

  return useQuery({
    queryKey: stockMovementKeys.list(params),

    queryFn: () =>
      stockMovementService.list({
        business_public_id: businessPublicId!,
        product_public_id: productPublicId!,
        page,
        page_size: pageSize,
        search,
        ordering,
      }),

    enabled: Boolean(
      businessPublicId && productPublicId
    ),

    placeholderData: (previousData) => previousData,
  });
}
