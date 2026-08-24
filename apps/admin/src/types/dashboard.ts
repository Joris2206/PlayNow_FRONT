import type {
  FinancialBusiness,
  FinancialDatePeriod,
} from "@/types/financial";

export type DashboardOverview = {
  business: FinancialBusiness;
  period: FinancialDatePeriod;
  cards: {
    sales_total: string;
    purchases_total: string;
    expenses_total: string;
    gross_margin_before_costs: string;
    outstanding_debt: string;
    outstanding_receivables: string;
    outstanding_payables: string;
    debt_payments_received: string;
    debt_payments_made: string;
    payments_received: string;
    payments_made: string;
    pending_commissions: string;
    cash_difference: string;
    current_inventory_units: number;
  };
  activity: {
    sales_count: number;
    purchases_count: number;
    expenses_count: number;
    debt_payments_count: number;
    pending_debts_count: number;
    closed_cash_registers_count: number;
    open_cash_register: boolean;
    low_stock_items_count: number;
    out_of_stock_items_count: number;
  };
  commissions: {
    gross_total: string;
    net_total: string;
    pending_total: string;
    paid_total: string;
  };
  cash: {
    closed_count: number;
    expected_total: string;
    counted_total: string;
    difference_total: string;
  };
};

export type DashboardOverviewParams = {
  business_public_id: string;
  date_from: string;
  date_to: string;
  low_stock_threshold?: number;
};
