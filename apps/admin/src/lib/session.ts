import { tokenStorage } from "@/lib/token-storage";
import { platformBusinessSelectionStorage } from "@/lib/business-selection-storage";

export type TokenPair = {
  access: string;
  refresh: string;
};

export type AuthSessionSnapshot = {
  revision: string;
  phase: "transitioning" | "authenticated" | "logged-out";
  transition: "login" | "logout";
};

type SessionTerminationCoordinator = {
  cancelQueries: () => Promise<void>;
  clearCache: () => void;
  redirectToLogin: () => void;
};

type TerminateSessionOptions = {
  expectedRevision?: string;
  lockAlreadyHeld?: boolean;
  remoteRevision?: string;
};

const AUTH_SESSION_KEY = "playnow_auth_session";
const AUTH_SESSION_LOCK = "playnow-auth-session";

const terminationCoordinators =
  new Set<SessionTerminationCoordinator>();

let sessionGeneration = 0;
let terminationPromise: Promise<void> | null = null;

function createRevision() {
  const cryptoApi = window.crypto;

  if (cryptoApi.randomUUID) {
    return cryptoApi.randomUUID();
  }

  const values = new Uint32Array(4);
  cryptoApi.getRandomValues(values);
  return Array.from(values, (value) =>
    value.toString(16).padStart(8, "0")
  ).join("");
}

function isAuthSessionSnapshot(
  value: unknown
): value is AuthSessionSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const snapshot = value as Record<string, unknown>;

  return (
    typeof snapshot.revision === "string" &&
    snapshot.revision.length > 0 &&
    ["transitioning", "authenticated", "logged-out"].includes(
      String(snapshot.phase)
    ) &&
    ["login", "logout"].includes(String(snapshot.transition))
  );
}

function parseAuthSessionSnapshot(value: string | null) {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return isAuthSessionSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeAuthSessionSnapshot(
  snapshot: AuthSessionSnapshot
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify(snapshot)
  );
}

function beginSessionTransition(
  transition: AuthSessionSnapshot["transition"]
) {
  sessionGeneration += 1;
  terminationPromise = null;

  const snapshot: AuthSessionSnapshot = {
    revision: createRevision(),
    phase: "transitioning",
    transition,
  };

  writeAuthSessionSnapshot(snapshot);
  return snapshot;
}

async function cancelQueries() {
  await Promise.allSettled(
    Array.from(terminationCoordinators).map((coordinator) =>
      coordinator.cancelQueries()
    )
  );
}

function clearCoordinators() {
  terminationCoordinators.forEach((coordinator) => {
    coordinator.clearCache();
  });
}

function redirectCoordinatorsToLogin() {
  terminationCoordinators.forEach((coordinator) => {
    coordinator.redirectToLogin();
  });
}

export function getSessionGeneration() {
  return sessionGeneration;
}

export function isCurrentSession(
  generation: number
) {
  return generation === sessionGeneration;
}

export function getAuthSessionSnapshot() {
  if (typeof window === "undefined") return null;

  return parseAuthSessionSnapshot(
    localStorage.getItem(AUTH_SESSION_KEY)
  );
}

export function isCurrentAuthRevision(
  revision: string | null
) {
  return Boolean(
    revision &&
      getAuthSessionSnapshot()?.revision === revision
  );
}

export function subscribeToAuthSession(
  listener: (snapshot: AuthSessionSnapshot) => void
) {
  if (typeof window === "undefined") return () => undefined;

  function handleStorage(event: StorageEvent) {
    if (event.key !== AUTH_SESSION_KEY) return;

    const snapshot = parseAuthSessionSnapshot(event.newValue);
    if (snapshot) listener(snapshot);
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function initializeAuthenticatedSession() {
  const current = getAuthSessionSnapshot();
  if (current) return current;

  const snapshot: AuthSessionSnapshot = {
    revision: createRevision(),
    phase: "authenticated",
    transition: "login",
  };

  writeAuthSessionSnapshot(snapshot);
  return snapshot;
}

export function supportsAuthSessionLock() {
  return Boolean(
    typeof navigator !== "undefined" &&
      navigator.locks
  );
}

export async function withAuthSessionLock<T>(
  operation: () => Promise<T>
): Promise<T> {
  if (supportsAuthSessionLock()) {
    return navigator.locks.request(
      AUTH_SESSION_LOCK,
      { mode: "exclusive" },
      operation
    );
  }

  return operation();
}

export async function establishAuthenticatedSession(
  access: string,
  refresh: string
) {
  const transition = beginSessionTransition("login");

  return withAuthSessionLock(async () => {
    const current = getAuthSessionSnapshot();
    if (
      current?.revision !== transition.revision ||
      current.phase !== "transitioning" ||
      current.transition !== "login"
    ) {
      return false;
    }

    platformBusinessSelectionStorage.clearAll();
    tokenStorage.setTokens(access, refresh);

    if (!isCurrentAuthRevision(transition.revision)) {
      return false;
    }

    writeAuthSessionSnapshot({
      ...transition,
      phase: "authenticated",
    });

    return true;
  });
}

export async function promoteAuthenticatedSession(
  revision: string
) {
  return withAuthSessionLock(async () => {
    const current = getAuthSessionSnapshot();

    if (
      current?.revision !== revision ||
      current.transition !== "login" ||
      !tokenStorage.getAccessToken() ||
      !tokenStorage.getRefreshToken()
    ) {
      return false;
    }

    if (current.phase === "authenticated") {
      return true;
    }

    if (current.phase !== "transitioning") {
      return false;
    }

    writeAuthSessionSnapshot({
      revision,
      phase: "authenticated",
      transition: "login",
    });

    return true;
  });
}

export async function reconcileAuthenticatedSession(
  revision: string
) {
  sessionGeneration += 1;
  terminationPromise = null;

  await cancelQueries();

  if (!isCurrentAuthRevision(revision)) {
    return false;
  }

  clearCoordinators();
  return true;
}

export function registerSessionTerminationCoordinator(
  coordinator: SessionTerminationCoordinator
) {
  terminationCoordinators.add(coordinator);

  return () => {
    terminationCoordinators.delete(coordinator);
  };
}

export async function terminateSession(
  options: TerminateSessionOptions = {}
) {
  const {
    expectedRevision,
    lockAlreadyHeld = false,
    remoteRevision,
  } = options;
  const currentSnapshot = getAuthSessionSnapshot();

  if (
    expectedRevision &&
    currentSnapshot?.revision !== expectedRevision
  ) {
    return;
  }

  if (
    remoteRevision &&
    currentSnapshot?.revision !== remoteRevision
  ) {
    return;
  }

  if (terminationPromise) {
    return terminationPromise;
  }

  const transition = remoteRevision
    ? (() => {
        sessionGeneration += 1;
        terminationPromise = null;
        return currentSnapshot;
      })()
    : beginSessionTransition("logout");

  if (!transition) return;

  const terminationGeneration = sessionGeneration;

  const operation = (async () => {
    const clearCredentials = remoteRevision
      ? withAuthSessionLock(async () => {
          if (isCurrentAuthRevision(transition.revision)) {
            tokenStorage.clearTokens();
          }
        })
      : lockAlreadyHeld
        ? Promise.resolve().then(() => {
            if (isCurrentAuthRevision(transition.revision)) {
              tokenStorage.clearTokens();
            }
          })
      : withAuthSessionLock(async () => {
          if (isCurrentAuthRevision(transition.revision)) {
            tokenStorage.clearTokens();
          }
        });

    await cancelQueries();

    if (
      !isCurrentSession(terminationGeneration) ||
      !isCurrentAuthRevision(transition.revision)
    ) {
      return;
    }

    platformBusinessSelectionStorage.clearAll();
    clearCoordinators();
    redirectCoordinatorsToLogin();

    await clearCredentials;

    if (
      !isCurrentSession(terminationGeneration) ||
      !isCurrentAuthRevision(transition.revision)
    ) {
      return;
    }

    writeAuthSessionSnapshot({
      revision: transition.revision,
      phase: "logged-out",
      transition: "logout",
    });
  })();

  terminationPromise = operation;

  try {
    await operation;
  } finally {
    if (terminationPromise === operation) {
      terminationPromise = null;
    }
  }
}

export function isTokenPair(
  value: unknown
): value is TokenPair {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const tokenPair = value as Record<string, unknown>;

  return (
    typeof tokenPair.access === "string" &&
    tokenPair.access.trim().length > 0 &&
    typeof tokenPair.refresh === "string" &&
    tokenPair.refresh.trim().length > 0
  );
}
