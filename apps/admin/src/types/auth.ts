export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
};

export type RefreshRequest = {
  refresh: string;
};

export type RefreshResponse = {
  access: string;
  refresh: string;
};