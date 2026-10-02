"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  commissionKeys,
  type CommissionPlanKeyParams,
} from "@/hooks/commission-query-keys";
import { commissionPlanService } from "@/services/commission-plan-service";
import type {
  CreateCommissionPlanInput,
  PatchCommissionPlanInput,
  ReplaceCommissionPlanInput,
} from "@/types/commission";

export function useCommissionPlans(params: CommissionPlanKeyParams) {
  return useQuery({
    queryKey: commissionKeys.planList(params),
    queryFn: () =>
      commissionPlanService.list({
        business_public_id: params.businessPublicId!,
        employee_public_id: params.employeePublicId,
        is_active: params.isActive,
        ordering: params.ordering,
        page: params.page,
        page_size: params.pageSize,
      }),
    enabled: Boolean(params.businessPublicId),
  });
}

export function useCommissionPlan(
  businessPublicId?: string,
  publicId?: string
) {
  return useQuery({
    queryKey: commissionKeys.planDetail(businessPublicId, publicId),
    queryFn: () => commissionPlanService.get(publicId!),
    enabled: Boolean(businessPublicId && publicId),
  });
}

function invalidatePlanPreviews(
  queryClient: ReturnType<typeof useQueryClient>,
  businessPublicId: string,
  employeePublicIds: readonly string[]
) {
  return employeePublicIds.map((employeePublicId) =>
    queryClient.invalidateQueries({
      queryKey: commissionKeys.previewsByEmployee(
        businessPublicId,
        employeePublicId
      ),
    })
  );
}

export function useCreateCommissionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommissionPlanInput) =>
      commissionPlanService.create(data),
    onSuccess: (plan, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.planLists(
            variables.business_public_id
          ),
        }),
        ...invalidatePlanPreviews(
          queryClient,
          variables.business_public_id,
          [plan.employee_public_id]
        ),
      ]),
  });
}

type ReplaceCommissionPlanVariables = {
  publicId: string;
  businessPublicId: string;
  previousEmployeePublicId: string;
  data: ReplaceCommissionPlanInput;
};

export function useReplaceCommissionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, data }: ReplaceCommissionPlanVariables) =>
      commissionPlanService.replace(publicId, data),
    onSuccess: (plan, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.planDetail(
            variables.businessPublicId,
            variables.publicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: commissionKeys.planLists(
            variables.businessPublicId
          ),
        }),
        ...invalidatePlanPreviews(
          queryClient,
          variables.businessPublicId,
          Array.from(
            new Set([
              variables.previousEmployeePublicId,
              plan.employee_public_id,
            ])
          )
        ),
      ]),
  });
}

export type PatchCommissionPlanVariables = {
  publicId: string;
  businessPublicId: string;
  previousEmployeePublicId: string;
  data: PatchCommissionPlanInput;
};

export function usePatchCommissionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, data }: PatchCommissionPlanVariables) =>
      commissionPlanService.patch(publicId, data),
    onSuccess: (plan, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.planDetail(
            variables.businessPublicId,
            variables.publicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: commissionKeys.planLists(
            variables.businessPublicId
          ),
        }),
        ...invalidatePlanPreviews(
          queryClient,
          variables.businessPublicId,
          Array.from(
            new Set([
              variables.previousEmployeePublicId,
              plan.employee_public_id,
            ])
          )
        ),
      ]),
  });
}

type DeleteCommissionPlanVariables = {
  publicId: string;
  businessPublicId: string;
  employeePublicId: string;
};

export function useDeleteCommissionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: DeleteCommissionPlanVariables) =>
      commissionPlanService.delete(publicId),
    onSuccess: (_result, variables) => {
      queryClient.removeQueries({
        queryKey: commissionKeys.planDetail(
          variables.businessPublicId,
          variables.publicId
        ),
      });
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.planLists(
            variables.businessPublicId
          ),
        }),
        ...invalidatePlanPreviews(
          queryClient,
          variables.businessPublicId,
          [variables.employeePublicId]
        ),
      ]);
    },
  });
}
