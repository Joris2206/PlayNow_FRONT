import type {
  CountAmount,
  FinancialBusiness,
  FinancialDatePeriod,
} from "@/types/financial";

export type PaymentMethodType =
  | "cash"
  | "card"
  | "transfer"
  | "other";

export type PaymentSummary = {
  business: FinancialBusiness;
  period: FinancialDatePeriod;
  totals: {
    sales: CountAmount;
    purchases: CountAmount;
    expenses: CountAmount;
    debt_payments: CountAmount;
    debt_payments_received: CountAmount;
    debt_payments_made: CountAmount;
    payments_received: string;
    payments_made: string;
    incoming_total: string;
    outgoing_total: string;
    net_amount: string;
  };
  results: Array<{
    payment_method: {
      public_id: string;
      name: string;
      method_type: PaymentMethodType;
    };
    sales: CountAmount;
    purchases: CountAmount;
    expenses: CountAmount;
    debt_payments: CountAmount;
    debt_payments_received: CountAmount;
    debt_payments_made: CountAmount;
    total_incoming: string;
    total_outgoing: string;
    net_amount: string;
  }>;
};

export type DebtDirectionSummary = {
  count: number;
  settled_count: number;
  pending_count: number;
  original_total: string;
  paid_total: string;
  outstanding: string;
};

export type DebtParty = {
  public_id: string;
  name?: string;
  full_name?: string;
};

export type DebtSummary = {
  business: FinancialBusiness;
  period: FinancialDatePeriod;
  generated: CountAmount;
  payments_received: CountAmount;
  payments_made: CountAmount;
  accounts_receivable: DebtDirectionSummary;
  accounts_payable: DebtDirectionSummary;
  unclassified: DebtDirectionSummary;
  portfolio_at_period_end: {
    original_debt_total: string;
    paid_until_period_end: string;
    outstanding: string;
    overdue_outstanding: string;
  };
  results: Array<{
    debt: {
      public_id: string;
      transaction_public_id: string;
    };
    transaction: {
      public_id: string;
      type: "sale" | "purchase" | "expense";
    };
    direction: "receivable" | "payable" | "unclassified";
    customer: DebtParty | null;
    supplier: DebtParty | null;
    employee: DebtParty | null;
    total_amount: string;
    total: string;
    paid_until_period_end: string;
    paid: string;
    pending_at_period_end: string;
    outstanding: string;
    is_settled_at_period_end: boolean;
    is_settled: boolean;
    due_date: string;
    was_overdue_at_period_end: boolean;
  }>;
};

export type MonthlySummary = {
  business: FinancialBusiness;
  period: FinancialDatePeriod & {
    year: number;
    month: number;
  };
  transactions: {
    sales: CountAmount & {
      paid_count: number;
      paid_total: string;
      debt_count: number;
      debt_total: string;
    };
    purchases: CountAmount;
    expenses: CountAmount;
  };
  debts: {
    generated_count: number;
    generated_total: string;
    payments_count: number;
    payments_total: string;
    payments_received: string;
    payments_made: string;
    outstanding_receivables: string;
    outstanding_payables: string;
    outstanding_unclassified: string;
    outstanding_at_period_end: string;
  };
  payments: {
    received: string;
    made: string;
    net: string;
    direct_sales: string;
    direct_purchases_and_expenses: string;
    debt_payments_received: string;
    debt_payments_made: string;
  };
  cash_registers: {
    closed_count: number;
    opening_total: string;
    expected_total: string;
    counted_total: string;
    difference_total: string;
    shortages_total: string;
    surpluses_total: string;
  };
  commissions: {
    settlements_count: number;
    settled_sales_total: string;
    gross_commission_total: string;
    employee_advances: string;
    employee_repayments: string;
    advance_balance: string;
    net_commission_payable: string;
    remaining_advance_balance: string;
    paid: CountAmount;
    pending: CountAmount;
  };
};

export type InventorySummaryLine = {
  product: {
    public_id: string;
    title: string;
  };
  opening_stock: number;
  entries: number;
  sales: number;
  positive_adjustments: number;
  negative_adjustments: number;
  net_movement: number;
  closing_stock: number;
  current_stock: number;
  movements_count: number;
};

export type InventorySummary = {
  business: FinancialBusiness;
  period: FinancialDatePeriod;
  totals: Omit<InventorySummaryLine, "product"> & {
    items_count: number;
  };
  results: InventorySummaryLine[];
};

export type ReportDateRangeParams = {
  business_public_id: string;
  date_from: string;
  date_to: string;
};

export type PaymentSummaryParams = ReportDateRangeParams & {
  payment_method_public_id?: string;
};

export type MonthlySummaryParams = {
  business_public_id: string;
  year: number;
  month: number;
};

export type InventorySummaryParams = ReportDateRangeParams & {
  product_public_id?: string;
};
