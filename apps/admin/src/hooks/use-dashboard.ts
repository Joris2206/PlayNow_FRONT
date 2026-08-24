"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  byBusiness(businessId: string | undefined) {
    return [...this.all, businessId] as const;
  },
  overview(
    businessId: string | undefined,
    dateFrom: string,
    dateTo: string,
    lowStockThreshold?: number
  ) {
    return [
      ...this.byBusiness(businessId),
      "overview",
      dateFrom,
      dateTo,
      lowStockThreshold,
    ] as const;
  },
};

type UseDashboardOverviewParams = {
  businessPublicId?: string;
  dateFrom: string;
  dateTo: string;
  lowStockThreshold?: number;
  enabled?: boolean;
};

export function useDashboardOverview({
  businessPublicId,
  dateFrom,
  dateTo,
  lowStockThreshold,
  enabled = true,
}: UseDashboardOverviewParams) {
  return useQuery({
    queryKey: dashboardKeys.overview(
      businessPublicId,
      dateFrom,
      dateTo,
      lowStockThreshold
    ),
    queryFn: () =>
      dashboardService.overview({
        business_public_id: businessPublicId!,
        date_from: dateFrom,
        date_to: dateTo,
        low_stock_threshold: lowStockThreshold,
      }),
    enabled: Boolean(
      enabled && businessPublicId && dateFrom && dateTo
    ),
  });
}
