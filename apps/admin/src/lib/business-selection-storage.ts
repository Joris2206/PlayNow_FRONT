const ACTIVE_BUSINESS_KEY_PREFIX =
  "playnow-active-business:";
const PLATFORM_ACTIVE_BUSINESS_KEY_PREFIX =
  "playnow-platform-active-business:";

export function getActiveBusinessStorageKey(
  userPublicId: string
) {
  return `${ACTIVE_BUSINESS_KEY_PREFIX}${userPublicId}`;
}

export const membershipBusinessPreferenceStorage = {
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

export function getPlatformBusinessStorageKey(
  userPublicId: string
) {
  return `${PLATFORM_ACTIVE_BUSINESS_KEY_PREFIX}${userPublicId}`;
}

export const platformBusinessSelectionStorage = {
  get(userPublicId: string) {
    if (typeof window === "undefined") return null;

    try {
      return sessionStorage.getItem(
        getPlatformBusinessStorageKey(userPublicId)
      );
    } catch {
      return null;
    }
  },

  set(userPublicId: string, businessPublicId: string) {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.setItem(
        getPlatformBusinessStorageKey(userPublicId),
        businessPublicId
      );
    } catch {
      // The in-memory selection remains usable when storage is unavailable.
    }
  },

  remove(userPublicId: string) {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.removeItem(
        getPlatformBusinessStorageKey(userPublicId)
      );
    } catch {
      // Storage is a convenience only and never grants access.
    }
  },

  clearAll() {
    if (typeof window === "undefined") return;

    try {
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);

        if (key?.startsWith(PLATFORM_ACTIVE_BUSINESS_KEY_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // Session termination continues even if storage is unavailable.
    }
  },
};
