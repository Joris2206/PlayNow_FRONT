export type Product = {
  public_id: string;
  business: string;
  category: string;
  title: string;
  description: string | null;
  image_url: string | null;
  base_price: string;
  base_cost: string;
  stock: number;
  is_visible: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ProductListParams = {
  business_public_id: string;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: number;
};