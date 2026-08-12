"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { productService } from "@/services/product-service";

import type {
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

    placeholderData: (previousData) => previousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateProductRequest
    ) => productService.create(data),

    onSuccess: (_product, variables) =>
      queryClient.invalidateQueries({
        queryKey: productKeys.byBusiness(
          variables.business_public_id
        ),
      }),
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

    onSuccess: (_product, variables) =>
      queryClient.invalidateQueries({
        queryKey: productKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
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

    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: productKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
  });
}
