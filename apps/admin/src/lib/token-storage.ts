const ACCESS_TOKEN_KEY = "playnow_access_token";
const REFRESH_TOKEN_KEY = "playnow_refresh_token";

export const tokenStorage = {
  getAccessToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(access: string, refresh: string) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  setAccessToken(access: string) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },

  clearTokens() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};