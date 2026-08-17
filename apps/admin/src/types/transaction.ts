import type { ListQueryParams } from "@/types/api";

export type TransactionType = "sale" | "purchase" | "expense";
export type PaymentStatus = "paid" | "partial" | "pending";

export type TransactionDetail = {
  public_id: string;
  product_public_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
};

export type Transaction = {
  public_id: string;
  business_public_id: string;
  business_name: string;
  customer_public_id: string | null;
  customer_name: string | null;
  supplier_public_id: string | null;
  supplier_name: string | null;
  employee_public_id: string | null;
  employee_name: string | null;
  payment_method_public_id: string | null;
  payment_method_name: string | null;
  type: TransactionType;
  is_debt: boolean;
  discount_percent: string | null;
  concept: string;
  total_value: string;
  status_public_id: string;
  status_name: string;
  invoice_number: string | null;
  payment_status: PaymentStatus;
  invoice_series: string | null;
  invoice_file_url: string;
  details: TransactionDetail[];
  business_currency: string;
  created_by_email: string;
  updated_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionListParams = ListQueryParams & {
  business_public_id: string;
  type: TransactionType;
  status_public_id?: string;
  date_from?: string;
  date_to?: string;
};

export type CreateSaleDetailRequest = {
  product_public_id: string;
  quantity: number;
  unit_price?: string | null;
};

export type CreateSaleRequest = {
  business_public_id: string;
  customer_public_id?: string;
  employee_public_id: string;
  type: "sale";
  payment_status: "paid";
  details: CreateSaleDetailRequest[];
};
