import type { ListQueryParams } from "@/types/api";

export type StockMovementType =
  | "entry"
  | "sale"
  | "adjustment";

export type StockMovementOriginType =
  | "sale"
  | "purchase"
  | "adjustment"
  | "unknown";

export type StockMovement = {
  public_id: string;
  product_public_id: string;
  product_name: string;
  transaction_public_id: string | null;
  transaction_detail_public_id: string | null;
  note: string;
  type: StockMovementType;
  quantity: number;
  origin_type: StockMovementOriginType;
  is_reversal: boolean | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type StockMovementListParams =
  ListQueryParams & {
    business_public_id: string;
    product_public_id: string;
  };
