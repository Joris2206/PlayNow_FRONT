import type { ListQueryParams } from "@/types/api";

export type CashRegisterStatus = "open" | "closed";

export type CashRegister = {
  public_id: string;
  business_public_id: string;
  business_currency: string;
  employee_public_id: string | null;
  employee_name: string | null;
  opened_by_public_id: string | null;
  opened_by_name: string | null;
  closed_by_public_id: string | null;
  closed_by_name: string | null;
  open_time: string;
  close_time: string | null;
  opening_balance: string;
  closing_balance: string | null;
  expected_closing_balance: string | null;
  difference: string | null;
  opening_notes: string;
  closing_notes: string;
  status: CashRegisterStatus;
  created_at: string;
  updated_at: string;
};

export type CashRegisterListOrdering =
  | "open_time"
  | "-open_time"
  | "close_time"
  | "-close_time"
  | "opening_balance"
  | "-opening_balance"
  | "closing_balance"
  | "-closing_balance"
  | "difference"
  | "-difference";

export type CashRegisterListParams =
  Omit<ListQueryParams, "search" | "ordering"> & {
    business_public_id: string;
    status?: CashRegisterStatus;
    employee_public_id?: string;
    ordering?: CashRegisterListOrdering;
  };

export type OpenCashRegisterRequest = {
  business_public_id: string;
  employee_public_id: string;
  opening_balance: string;
  opening_notes?: string;
};

export type CloseCashRegisterRequest = {
  closing_balance: string;
  closing_notes?: string;
};

export type CashRegisterClosingPreview = {
  period: {
    open_time: string;
    until: string;
  };
  opening_balance: string;
  sales: {
    cash: string;
    card: string;
    transfer: string;
    other: string;
    total: string;
  };
  cash_purchases: string;
  cash_expenses: string;
  cash_debt_payments: string;
  cash_debt_payments_received: string;
  cash_debt_payments_made: string;
  automatic_cash_inflows: string;
  automatic_cash_outflows: string;
  movements: {
    deposits: string;
    withdrawals: string;
    employee_advances: string;
    employee_repayments: string;
    other_income: string;
    other_expense: string;
  };
  expected_closing_balance: string;
};

export type CashMovementType =
  | "deposit"
  | "withdrawal"
  | "employee_advance"
  | "employee_repayment"
  | "other_income"
  | "other_expense";

export type CashMovement = {
  public_id: string;
  cash_register_public_id: string;
  cash_register_status: CashRegisterStatus;
  business_public_id: string;
  employee_public_id: string | null;
  employee_name: string | null;
  payment_method_public_id: string | null;
  payment_method_name: string | null;
  movement_type: CashMovementType;
  amount: string;
  signed_amount: string;
  note: string;
  created_by_public_id: string;
  created_by_name: string;
  created_at: string;
};

export type CashMovementListOrdering =
  | "created_at"
  | "-created_at"
  | "amount"
  | "-amount"
  | "movement_type"
  | "-movement_type";

export type CashMovementListParams =
  Omit<ListQueryParams, "search" | "ordering"> & {
    business_public_id: string;
    cash_register_public_id?: string;
    employee_public_id?: string;
    payment_method_public_id?: string;
    movement_type?: CashMovementType;
    ordering?: CashMovementListOrdering;
  };

export type CreateCashMovementRequest = {
  cash_register_public_id: string;
  movement_type: CashMovementType;
  amount: string;
  note?: string;
  employee_public_id?: string | null;
  payment_method_public_id?: string | null;
};
