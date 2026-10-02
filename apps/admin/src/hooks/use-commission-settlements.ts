"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commissionKeys } from "@/hooks/commission-query-keys";
import { dashboardKeys } from "@/hooks/use-dashboard";
import { reportKeys } from "@/hooks/use-reports";
import { HttpError } from "@/lib/http";
import { commissionSettlementService } from "@/services/commission-settlement-service";
import type {
  CommissionSettlementKeyParams,
} from "@/hooks/commission-query-keys";
import type { CreateCommissionSettlementInput } from "@/types/commission";

export function useCommissionSettlements(
  params: CommissionSettlementKeyParams
) {
  return useQuery({
    queryKey: commissionKeys.settlementList(params),
    queryFn: () =>
      commissionSettlementService.list({
        business_public_id: params.businessPublicId!,
        employee_public_id: params.employeePublicId,
        status: params.status,
        period_start: params.periodStart,
        period_end: params.periodEnd,
        ordering: params.ordering,
        page: params.page,
        page_size: Math.min(params.pageSize, 200),
      }),
    enabled: Boolean(params.businessPublicId),
  });
}

export function useCommissionSettlement(
  businessPublicId?: string,
  publicId?: string
) {
  return useQuery({
    queryKey: commissionKeys.settlementDetail(
      businessPublicId,
      publicId
    ),
    queryFn: () => commissionSettlementService.get(publicId!),
    enabled: Boolean(businessPublicId && publicId),
  });
}

function invalidateSettlementAggregates(
  queryClient: ReturnType<typeof useQueryClient>,
  businessPublicId: string
) {
  return [
    queryClient.invalidateQueries({
      queryKey: dashboardKeys.byBusiness(businessPublicId),
    }),
    queryClient.invalidateQueries({
      queryKey: reportKeys.monthlyScope(businessPublicId),
    }),
  ];
}

export function useCreateCommissionSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommissionSettlementInput) =>
      commissionSettlementService.create(data),
    onSuccess: (settlement, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.settlementLists(
            variables.business_public_id
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: commissionKeys.preview(
            variables.business_public_id,
            variables.employee_public_id,
            variables.period_start,
            variables.period_end
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: commissionKeys.settlementDetail(
            variables.business_public_id,
            settlement.public_id
          ),
        }),
        ...invalidateSettlementAggregates(
          queryClient,
          variables.business_public_id
        ),
      ]),
  });
}

export type MarkCommissionSettlementPaidVariables = {
  publicId: string;
  businessPublicId: string;
};

export function useMarkCommissionSettlementPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: MarkCommissionSettlementPaidVariables) =>
      commissionSettlementService.markPaid(publicId),
    onSuccess: (_settlement, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.settlementDetail(
            variables.businessPublicId,
            variables.publicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: commissionKeys.settlementLists(
            variables.businessPublicId
          ),
        }),
        ...invalidateSettlementAggregates(
          queryClient,
          variables.businessPublicId
        ),
      ]),
    onError: (error, variables) => {
      if (!(error instanceof HttpError) || error.status !== 400) {
        return;
      }
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: commissionKeys.settlementDetail(
            variables.businessPublicId,
            variables.publicId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: commissionKeys.settlementLists(
            variables.businessPublicId
          ),
        }),
      ]);
    },
  });
}
