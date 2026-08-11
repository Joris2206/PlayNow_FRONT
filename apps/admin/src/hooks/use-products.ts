"use client";

import { useQuery } from "@tanstack/react-query";

import { productService } from "@/services/product-service";

type UseProductsParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  status?: number;
};

export function useProducts({
  businessPublicId,
  page,
  pageSize,
  search,
  ordering,
  status,
}: UseProductsParams) {
  return useQuery({
    queryKey: [
      "products",
      businessPublicId,
      page,
      pageSize,
      search,
      ordering,
      status,
    ],

    queryFn: () =>
      productService.list({
        business_public_id: businessPublicId!,
        page,
        page_size: pageSize,
        search,
        ordering,
        status,
      }),

    enabled: Boolean(businessPublicId),

    placeholderData: (previousData) => previousData,
  });
}