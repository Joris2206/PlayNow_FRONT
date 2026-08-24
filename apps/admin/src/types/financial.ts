export type FinancialBusiness = {
  public_id: string;
  name: string;
  currency: string;
};

export type FinancialDatePeriod = {
  date_from: string;
  date_to: string;
};

export type CountAmount = {
  count: number;
  total: string;
};
