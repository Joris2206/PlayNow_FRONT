import type { BusinessListQueryParams } from "@/types/api";

export type Product = {
  public_id: string;
  business: string;
  category: string;
  category_name: string;
  title: string;
  description: string | null;
  image_url: string | null;
  base_price: string;
  base_cost: string;
  stock: number;
  is_visible: boolean;
  status: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type ProductListParams =
  BusinessListQueryParams;
