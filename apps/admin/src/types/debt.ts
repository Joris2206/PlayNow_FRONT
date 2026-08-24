import type { ListQueryParams } from "@/types/api";
import type { PaymentStatus, TransactionType } from "@/types/transaction";

export type DebtDirection = "receivable" | "payable" | null;

export type Debt = {
  public_id: string;
  business_public_id: string;
  transaction_public_id: string;
  direction: DebtDirection;
  total_amount: string;
  paid_amount: string;
  outstanding_amount: string;
  interest_rate: string;
  term_months: number;
  customer_public_id: string | null;
  customer_name: string | null;
  supplier_public_id: string | null;
  supplier_name: string | null;
  transaction_type: TransactionType;
  transaction_status_name: string;
  payment_status: PaymentStatus;
  due_date: string;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
};

export type DebtListParams = Omit<ListQueryParams, "search"> & {
  business_public_id: string;
  transaction_type?: TransactionType;
  is_settled?: boolean;
  customer_public_id?: string;
  supplier_public_id?: string;
  transaction_public_id?: string;
};

export type DebtPayment = {
  public_id: string;
  business_public_id: string;
  debt_public_id: string;
  amount: string;
  payment_date: string;
  payment_method_public_id: string;
  payment_method_name: string;
  customer_name: string | null;
  supplier_name: string | null;
  transaction_public_id: string | null;
  created_by_public_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDebtPaymentRequest = {
  debt_public_id: string;
  amount: string;
  payment_date: string;
  payment_method_public_id: string;
};

export type DebtPaymentListParams = Omit<ListQueryParams, "search"> & {
  business_public_id: string;
  debt_public_id: string;
};
