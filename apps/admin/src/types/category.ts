export type Category = {
  public_id: string;
  business: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CreateCategoryRequest = {
  business: string;
  name: string;
};