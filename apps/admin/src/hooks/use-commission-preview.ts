"use client";

import { useQuery } from "@tanstack/react-query";
import { commissionKeys } from "@/hooks/commission-query-keys";
import { commissionPreviewService } from "@/services/commission-preview-service";

type UseCommissionPreviewParams = {
  businessPublicId?: string;
  employeePublicId?: string;
  dateFrom: string;
  dateTo: string;
  enabled?: boolean;
};

export function useCommissionPreview(
  params: UseCommissionPreviewParams
) {
  const validPeriod = Boolean(
    params.dateFrom &&
      params.dateTo &&
      params.dateFrom <= params.dateTo
  );
  return useQuery({
    queryKey: commissionKeys.preview(
      params.businessPublicId,
      params.employeePublicId,
      params.dateFrom,
      params.dateTo
    ),
    queryFn: () =>
      commissionPreviewService.get({
        business_public_id: params.businessPublicId!,
        employee_public_id: params.employeePublicId!,
        date_from: params.dateFrom,
        date_to: params.dateTo,
      }),
    enabled: Boolean(
      params.enabled &&
        params.businessPublicId &&
        params.employeePublicId &&
        validPeriod
    ),
  });
}
