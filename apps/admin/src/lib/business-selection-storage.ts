const ACTIVE_BUSINESS_KEY_PREFIX =
  "playnow-active-business:";

export function getActiveBusinessStorageKey(
  userPublicId: string
) {
  return `${ACTIVE_BUSINESS_KEY_PREFIX}${userPublicId}`;
}

export const businessSelectionStorage = {
  get(userPublicId: string) {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(
        getActiveBusinessStorageKey(userPublicId)
      );
    } catch {
      return null;
    }
  },

  set(userPublicId: string, businessPublicId: string) {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        getActiveBusinessStorageKey(userPublicId),
        businessPublicId
      );
    } catch {
      // The in-memory selection remains usable when storage is unavailable.
    }
  },

  remove(userPublicId: string) {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(
        getActiveBusinessStorageKey(userPublicId)
      );
    } catch {
      // Storage is a convenience only and never grants access.
    }
  },
};
