import { tokenStorage } from "@/lib/token-storage";

export type TokenPair = {
  access: string;
  refresh: string;
};

type SessionTerminationCoordinator = {
  cancelQueries: () => Promise<void>;
  clearCache: () => void;
  redirectToLogin: () => void;
};

const terminationCoordinators =
  new Set<SessionTerminationCoordinator>();

let sessionGeneration = 0;
let terminationPromise: Promise<void> | null = null;

export function getSessionGeneration() {
  return sessionGeneration;
}

export function isCurrentSession(
  generation: number
) {
  return generation === sessionGeneration;
}

export function prepareForLogin() {
  sessionGeneration += 1;
  terminationPromise = null;
  tokenStorage.clearTokens();
}

export function startSession() {
  sessionGeneration += 1;
  terminationPromise = null;
}

export function registerSessionTerminationCoordinator(
  coordinator: SessionTerminationCoordinator
) {
  terminationCoordinators.add(coordinator);

  return () => {
    terminationCoordinators.delete(coordinator);
  };
}

export async function terminateSession() {
  if (terminationPromise) {
    return terminationPromise;
  }

  sessionGeneration += 1;
  const terminationGeneration = sessionGeneration;

  const coordinators = Array.from(
    terminationCoordinators
  );

  terminationPromise = (async () => {
    await Promise.allSettled(
      coordinators.map((coordinator) =>
        coordinator.cancelQueries()
      )
    );

    if (!isCurrentSession(terminationGeneration)) {
      return;
    }

    tokenStorage.clearTokens();

    coordinators.forEach((coordinator) => {
      coordinator.clearCache();
    });

    coordinators.forEach((coordinator) => {
      coordinator.redirectToLogin();
    });
  })();

  return terminationPromise;
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
