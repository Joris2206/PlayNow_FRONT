"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { categoryService } from "@/services/category-service";

import type { CreateCategoryRequest } from "@/types/category";

type UseCategoriesParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: string;
  statusPublicId?: string;
};

export const categoryKeys = {
  all: ["categories"] as const,

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
  }: UseCategoriesParams) {
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

export function useCategories(
  params: UseCategoriesParams
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
    queryKey: categoryKeys.list(params),

    queryFn: () =>
      categoryService.list({
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

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateCategoryRequest
    ) => categoryService.create(data),

    onSuccess: (_category, variables) =>
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byBusiness(
          variables.business_public_id
        ),
      }),
  });
}
