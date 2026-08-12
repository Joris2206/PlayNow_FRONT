export type PaginatedResponse<T> = {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ListQueryParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
};

export type BusinessListQueryParams = ListQueryParams & {
  business_public_id: string;
  status?: number;
};