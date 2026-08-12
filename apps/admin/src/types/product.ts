import type { BusinessListQueryParams } from "@/types/api";

export type Product = {
  public_id: string;
  business_public_id: string;
  category_public_id: string;
  category_name: string;
  title: string;
  description: string | null;
  image_url: string | null;
  base_price: string;
  base_cost: string;
  stock: number;
  is_visible: boolean;
  status_public_id: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type ProductListParams =
  BusinessListQueryParams;

export type CreateProductRequest = {
  business_public_id: string;
  category_public_id: string;
  title: string;
  description: string;
  image_url: string;
  base_price: string;
  base_cost: string;
  stock: number;
  is_visible: boolean;
};

export type UpdateProductRequest = {
  business_public_id?: string;
  category_public_id?: string;
  title?: string;
  description?: string;
  image_url?: string;
  base_price?: string;
  base_cost?: string;
  stock?: number;
  is_visible?: boolean;
  status_public_id?: string;
};
