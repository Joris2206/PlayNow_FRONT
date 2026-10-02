export type CommissionPlan = {
  public_id: string;
  business_public_id: string;
  employee_public_id: string;
  employee_name: string;
  percentage: string;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateCommissionPlanInput = {
  business_public_id: string;
  employee_public_id: string;
  percentage: string;
  valid_from: string;
  valid_until?: string | null;
  is_active?: boolean;
};

export type ReplaceCommissionPlanInput = {
  employee_public_id: string;
  percentage: string;
  valid_from: string;
  valid_until?: string | null;
  is_active?: boolean;
};

export type PatchCommissionPlanInput =
  Partial<ReplaceCommissionPlanInput>;

type Directional<T extends string> = T | `-${T}`;

export type CommissionPlanOrdering = Directional<
  "valid_from" | "valid_until" | "percentage" | "created_at"
>;

export type CommissionPlanFilters = {
  business_public_id: string;
  employee_public_id?: string;
  is_active?: boolean;
  ordering?: CommissionPlanOrdering;
  page?: number;
  page_size?: number;
};

export type CommissionPreviewParams = {
  business_public_id: string;
  employee_public_id: string;
  date_from: string;
  date_to: string;
};

export type CommissionPreview = {
  business: {
    public_id: string;
    name: string;
    currency: string;
  };
  employee: {
    public_id: string;
    full_name: string;
  };
  period: {
    date_from: string;
    date_to: string;
  };
  sales_count: number;
  sales_total: string;
  commission_percentage: string;
  commission_total: string;
  employee_advances: string;
  employee_repayments: string;
  advance_balance: string;
  net_commission_payable: string;
  remaining_advance_balance: string;
  commission_plan_public_id: string;
};

export type CommissionSettlementStatus =
  | "pending"
  | "paid"
  | "cancelled";

export type CommissionSettlement = {
  public_id: string;
  business_public_id: string;
  business_currency: string;
  employee_public_id: string;
  employee_name: string;
  employee_position: string;
  period_start: string;
  period_end: string;
  sales_count: number;
  sales_total: string;
  commission_percentage: string;
  commission_total: string;
  employee_advances: string;
  employee_repayments: string;
  advance_balance: string;
  net_commission_payable: string;
  remaining_advance_balance: string;
  status: CommissionSettlementStatus;
  paid_at: string | null;
  created_by_public_id: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};

export type CreateCommissionSettlementInput = {
  business_public_id: string;
  employee_public_id: string;
  period_start: string;
  period_end: string;
};

export type CommissionSettlementOrdering = Directional<
  | "period_start"
  | "period_end"
  | "sales_total"
  | "commission_total"
  | "created_at"
  | "paid_at"
> | "-period_end,-created_at";

export type CommissionSettlementFilters = {
  business_public_id: string;
  employee_public_id?: string;
  status?: CommissionSettlementStatus;
  period_start?: string;
  period_end?: string;
  ordering?: CommissionSettlementOrdering;
  page?: number;
  page_size?: number;
};
