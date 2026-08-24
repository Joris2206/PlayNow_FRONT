import type {
  CashMovementListOrdering,
  CashMovementType,
  CashRegisterListOrdering,
  CashRegisterStatus,
} from "@/types/cash";

export type CashRegisterKeyParams = {
  businessPublicId?: string;
  status?: CashRegisterStatus;
  employeePublicId?: string;
  page: number;
  pageSize: number;
  ordering?: CashRegisterListOrdering;
};

export type CashMovementKeyParams = {
  businessPublicId?: string;
  cashRegisterPublicId?: string;
  employeePublicId?: string;
  paymentMethodPublicId?: string;
  movementType?: CashMovementType;
  page: number;
  pageSize: number;
  ordering?: CashMovementListOrdering;
};

export const cashRegisterKeys = {
  all: ["cash-registers"] as const,

  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },

  lists(businessPublicId: string | undefined) {
    return [
      ...this.byBusiness(businessPublicId),
      "list",
    ] as const;
  },

  list(params: CashRegisterKeyParams) {
    return [
      ...this.lists(params.businessPublicId),
      params.status,
      params.employeePublicId,
      params.page,
      params.pageSize,
      params.ordering,
    ] as const;
  },

  details(businessPublicId: string | undefined) {
    return [
      ...this.byBusiness(businessPublicId),
      "detail",
    ] as const;
  },

  detail(
    businessPublicId: string | undefined,
    publicId: string | undefined
  ) {
    return [
      ...this.details(businessPublicId),
      publicId,
    ] as const;
  },

  previews(businessPublicId: string | undefined) {
    return [
      ...this.byBusiness(businessPublicId),
      "preview",
    ] as const;
  },

  preview(
    businessPublicId: string | undefined,
    publicId: string | undefined
  ) {
    return [
      ...this.previews(businessPublicId),
      publicId,
    ] as const;
  },
};

export const cashMovementKeys = {
  all: ["cash-movements"] as const,

  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },

  byRegister(
    businessPublicId: string | undefined,
    cashRegisterPublicId: string | undefined
  ) {
    return [
      ...this.byBusiness(businessPublicId),
      "register",
      cashRegisterPublicId,
    ] as const;
  },

  list(params: CashMovementKeyParams) {
    return [
      ...this.byRegister(
        params.businessPublicId,
        params.cashRegisterPublicId
      ),
      params.employeePublicId,
      params.paymentMethodPublicId,
      params.movementType,
      params.page,
      params.pageSize,
      params.ordering,
    ] as const;
  },
};
