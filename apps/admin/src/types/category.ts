export type Category = {
  public_id: string;
  business: string;
  name: string;
  status: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type CreateCategoryRequest = {
  business_public_id: string;
  name: string;
};
