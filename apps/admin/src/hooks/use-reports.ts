"use client";

import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/report-service";

export const reportKeys = {
  all: ["reports"] as const,
  byBusiness(businessId: string | undefined) {
    return [...this.all, businessId] as const;
  },
  paymentsScope(businessId: string | undefined) {
    return [...this.byBusiness(businessId), "payments"] as const;
  },
  payments(
    businessId: string | undefined,
    dateFrom: string,
    dateTo: string,
    paymentMethodId?: string
  ) {
    return [
      ...this.paymentsScope(businessId),
      dateFrom,
      dateTo,
      paymentMethodId,
    ] as const;
  },
  debtsScope(businessId: string | undefined) {
    return [...this.byBusiness(businessId), "debts"] as const;
  },
  debts(businessId: string | undefined, dateFrom: string, dateTo: string) {
    return [...this.debtsScope(businessId), dateFrom, dateTo] as const;
  },
  monthlyScope(businessId: string | undefined) {
    return [...this.byBusiness(businessId), "monthly"] as const;
  },
  monthly(businessId: string | undefined, year: number, month: number) {
    return [...this.monthlyScope(businessId), year, month] as const;
  },
  inventoryScope(businessId: string | undefined) {
    return [...this.byBusiness(businessId), "inventory"] as const;
  },
  inventory(
    businessId: string | undefined,
    dateFrom: string,
    dateTo: string,
    productId?: string
  ) {
    return [
      ...this.inventoryScope(businessId),
      dateFrom,
      dateTo,
      productId,
    ] as const;
  },
};

type RangeQueryParams = {
  businessPublicId?: string;
  dateFrom: string;
  dateTo: string;
  enabled?: boolean;
};

export function usePaymentSummary(
  params: RangeQueryParams & { paymentMethodPublicId?: string }
) {
  return useQuery({
    queryKey: reportKeys.payments(
      params.businessPublicId,
      params.dateFrom,
      params.dateTo,
      params.paymentMethodPublicId
    ),
    queryFn: () => reportService.payments({
      business_public_id: params.businessPublicId!,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      payment_method_public_id: params.paymentMethodPublicId,
    }),
    enabled: Boolean(
      params.enabled && params.businessPublicId && params.dateFrom && params.dateTo
    ),
  });
}

export function useDebtSummary(params: RangeQueryParams) {
  return useQuery({
    queryKey: reportKeys.debts(
      params.businessPublicId,
      params.dateFrom,
      params.dateTo
    ),
    queryFn: () => reportService.debts({
      business_public_id: params.businessPublicId!,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    }),
    enabled: Boolean(
      params.enabled && params.businessPublicId && params.dateFrom && params.dateTo
    ),
  });
}

export function useMonthlySummary(params: {
  businessPublicId?: string;
  year: number;
  month: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: reportKeys.monthly(
      params.businessPublicId,
      params.year,
      params.month
    ),
    queryFn: () => reportService.monthly({
      business_public_id: params.businessPublicId!,
      year: params.year,
      month: params.month,
    }),
    enabled: Boolean(params.enabled && params.businessPublicId),
  });
}

export function useInventorySummary(
  params: RangeQueryParams & { productPublicId?: string }
) {
  return useQuery({
    queryKey: reportKeys.inventory(
      params.businessPublicId,
      params.dateFrom,
      params.dateTo,
      params.productPublicId
    ),
    queryFn: () => reportService.inventory({
      business_public_id: params.businessPublicId!,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      product_public_id: params.productPublicId,
    }),
    enabled: Boolean(
      params.enabled && params.businessPublicId && params.dateFrom && params.dateTo
    ),
  });
}
