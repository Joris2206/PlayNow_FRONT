"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { dashboardKeys } from "@/hooks/use-dashboard";
import { reportKeys } from "@/hooks/use-reports";
import { stockMovementKeys } from "@/hooks/use-stock-movements";
import { HttpError } from "@/lib/http";
import { productService } from "@/services/product-service";

import type {
  AdjustProductStockRequest,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";

type UseProductsParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  statusPublicId?: string;
};

export const productKeys = {
  all: ["products"] as const,

  byBusiness(businessPublicId: string | undefined) {
    return [
      ...this.all,
      businessPublicId,
    ] as const;
  },

  list({
    businessPublicId,
    page,
    pageSize,
    search,
    ordering,
    statusPublicId,
  }: UseProductsParams) {
    return [
      ...this.byBusiness(businessPublicId),
      page,
      pageSize,
      search,
      ordering,
      statusPublicId,
    ] as const;
  },
};

export function useProducts(
  params: UseProductsParams
) {
  const {
    businessPublicId,
    page,
    pageSize,
    search,
    ordering,
    statusPublicId,
  } = params;

  return useQuery({
    queryKey: productKeys.list(params),

    queryFn: () =>
      productService.list({
        business_public_id: businessPublicId!,
        page,
        page_size: pageSize,
        search,
        ordering,
        status_public_id: statusPublicId,
      }),

    enabled: Boolean(businessPublicId),

    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === businessPublicId
        ? previousData
        : undefined,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateProductRequest
    ) => productService.create(data),

    onSuccess: (_product, variables) => Promise.all([
      queryClient.invalidateQueries({
        queryKey: productKeys.byBusiness(
          variables.business_public_id
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.byBusiness(variables.business_public_id),
      }),
      queryClient.invalidateQueries({
        queryKey: reportKeys.inventoryScope(variables.business_public_id),
      }),
    ]),
  });
}

type UpdateProductVariables = {
  publicId: string;
  businessPublicId: string;
  data: UpdateProductRequest;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
      data,
    }: UpdateProductVariables) =>
      productService.update(publicId, data),

    onSuccess: (_product, variables) => Promise.all([
      queryClient.invalidateQueries({
        queryKey: productKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: reportKeys.inventoryScope(variables.businessPublicId),
      }),
    ]),
  });
}

type DeleteProductVariables = {
  publicId: string;
  businessPublicId: string;
};

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
    }: DeleteProductVariables) =>
      productService.delete(publicId),

    onSuccess: (_result, variables) => Promise.all([
      queryClient.invalidateQueries({
        queryKey: productKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.byBusiness(variables.businessPublicId),
      }),
      queryClient.invalidateQueries({
        queryKey: reportKeys.inventoryScope(variables.businessPublicId),
      }),
    ]),
  });
}

type AdjustProductStockVariables = {
  productPublicId: string;
  businessPublicId: string;
  input: AdjustProductStockRequest;
};

export function useAdjustProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productPublicId,
      input,
    }: AdjustProductStockVariables) =>
      productService.adjustStock(
        productPublicId,
        input
      ),

    retry: false,

    onSuccess: (_response, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.byBusiness(
            variables.businessPublicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: stockMovementKeys.byBusiness(
            variables.businessPublicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardKeys.byBusiness(
            variables.businessPublicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: reportKeys.inventoryScope(
            variables.businessPublicId
          ),
        }),
      ]),

    onError: (error, variables) => {
      if (
        error instanceof HttpError &&
        (error.status === 400 || error.status === 404)
      ) {
        return queryClient.invalidateQueries({
          queryKey: productKeys.byBusiness(
            variables.businessPublicId
          ),
        });
      }
    },
  });
}
