import type { ListQueryParams } from "@/types/api";

export type StockMovementType =
  | "entry"
  | "sale"
  | "adjustment";

export type StockMovement = {
  public_id: string;
  product_public_id: string;
  product_name: string;
  variant_public_id: string | null;
  variant_name: string | null;
  variant_type_name: string | null;
  transaction_public_id: string | null;
  transaction_detail_public_id: string | null;
  note: string;
  type: StockMovementType;
  quantity: number;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type StockMovementListParams =
  ListQueryParams & {
    business_public_id: string;
    product_public_id: string;
  };
