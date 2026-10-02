import type {
  CommissionPlanOrdering,
  CommissionSettlementOrdering,
  CommissionSettlementStatus,
} from "@/types/commission";

export type CommissionPlanKeyParams = {
  businessPublicId?: string;
  employeePublicId?: string;
  isActive?: boolean;
  ordering?: CommissionPlanOrdering;
  page: number;
  pageSize: number;
};

export type CommissionSettlementKeyParams = {
  businessPublicId?: string;
  employeePublicId?: string;
  status?: CommissionSettlementStatus;
  periodStart?: string;
  periodEnd?: string;
  ordering?: CommissionSettlementOrdering;
  page: number;
  pageSize: number;
};

export const commissionKeys = {
  all: ["commissions"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  plans(businessPublicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "plans"] as const;
  },
  planLists(businessPublicId: string | undefined) {
    return [...this.plans(businessPublicId), "list"] as const;
  },
  planList(params: CommissionPlanKeyParams) {
    return [
      ...this.planLists(params.businessPublicId),
      params.employeePublicId,
      params.isActive,
      params.ordering,
      params.page,
      params.pageSize,
    ] as const;
  },
  planDetails(businessPublicId: string | undefined) {
    return [...this.plans(businessPublicId), "detail"] as const;
  },
  planDetail(
    businessPublicId: string | undefined,
    publicId: string | undefined
  ) {
    return [...this.planDetails(businessPublicId), publicId] as const;
  },
  previews(businessPublicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "preview"] as const;
  },
  previewsByEmployee(
    businessPublicId: string | undefined,
    employeePublicId: string | undefined
  ) {
    return [
      ...this.previews(businessPublicId),
      employeePublicId,
    ] as const;
  },
  preview(
    businessPublicId: string | undefined,
    employeePublicId: string | undefined,
    dateFrom: string,
    dateTo: string
  ) {
    return [
      ...this.previewsByEmployee(businessPublicId, employeePublicId),
      dateFrom,
      dateTo,
    ] as const;
  },
  settlements(businessPublicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "settlements"] as const;
  },
  settlementLists(businessPublicId: string | undefined) {
    return [...this.settlements(businessPublicId), "list"] as const;
  },
  settlementList(params: CommissionSettlementKeyParams) {
    return [
      ...this.settlementLists(params.businessPublicId),
      params.employeePublicId,
      params.status,
      params.periodStart,
      params.periodEnd,
      params.ordering,
      params.page,
      params.pageSize,
    ] as const;
  },
  settlementDetails(businessPublicId: string | undefined) {
    return [...this.settlements(businessPublicId), "detail"] as const;
  },
  settlementDetail(
    businessPublicId: string | undefined,
    publicId: string | undefined
  ) {
    return [
      ...this.settlementDetails(businessPublicId),
      publicId,
    ] as const;
  },
};
