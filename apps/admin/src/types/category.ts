export type Category = {
  public_id: string;
  business_public_id: string;
  name: string;
  status_public_id: string;
  status_name: string;
  created_at: string;
  updated_at: string;
};

export type CreateCategoryRequest = {
  business_public_id: string;
  name: string;
};

export type UpdateCategoryRequest = {
  business_public_id?: string;
  name?: string;
  status_public_id?: string;
};
