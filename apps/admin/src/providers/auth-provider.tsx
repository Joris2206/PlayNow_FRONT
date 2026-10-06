"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/lib/auth-query-keys";
import {
  getActiveBusinessStorageKey,
  membershipBusinessPreferenceStorage,
  platformBusinessSelectionStorage,
} from "@/lib/business-selection-storage";
import { HttpError } from "@/lib/http";
import {
  getAuthSessionSnapshot,
  initializeAuthenticatedSession,
  promoteAuthenticatedSession,
  reconcileAuthenticatedSession,
  registerSessionTerminationCoordinator,
  subscribeToAuthSession,
  terminateSession,
} from "@/lib/session";
import { tokenStorage } from "@/lib/token-storage";
import { businessKeys } from "@/hooks/use-businesses";
import { businessService } from "@/services/business-service";
import { userService } from "@/services/user-service";

import type { Business } from "@/types/business";
import type {
  AuthUser,
  BusinessMembership,
} from "@/types/user";

type BusinessStatus =
  | "resolving"
  | "resolved"
  | "selection-required"
  | "verification-error"
  | "empty";

export type ActiveBusinessContext =
  | ({ source: "membership" } & BusinessMembership)
  | {
      source: "platform";
      business_public_id: string;
      business_name: string;
      membership_public_id: null;
      role: null;
      employee_public_id: null;
    };

type AuthContextValue = {
  user: AuthUser | null;
  memberships: BusinessMembership[];
  activeContext: ActiveBusinessContext | null;
  activeMembership: BusinessMembership | null;
  activeBusiness: { public_id: string; name: string } | null;
  activeBusinessPublicId: string | undefined;
  role: BusinessMembership["role"] | null;
  employeePublicId: string | null;
  isPlatformAdmin: boolean;
  businessStatus: BusinessStatus;
  businessVerificationError: Error | null;
  selectMembership: (membershipPublicId: string) => boolean;
  selectBusiness: (business: Business) => boolean;
  retryBusinessVerification: () => void;
  status: "checking" | "authenticated" | "error";
  error: Error | null;
  retry: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type BusinessSelectionState =
  | {
      userPublicId: string;
      status: "resolved";
      businessPublicId: string;
    }
  | {
      userPublicId: string;
      status: "selection-required" | "empty";
    };

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [canValidateSession, setCanValidateSession] =
    useState<boolean | null>(null);
  const [authRevision, setAuthRevision] =
    useState<string | null>(null);
  const [businessSelection, setBusinessSelection] =
    useState<BusinessSelectionState | null>(null);

  useEffect(() => {
    let isActive = true;
    let synchronizationQueue = Promise.resolve();

    const unregister = registerSessionTerminationCoordinator({
      cancelQueries: () => queryClient.cancelQueries(),
      clearCache: () => {
        queryClient.clear();
        setCanValidateSession(false);
        setAuthRevision(null);
        setBusinessSelection(null);
      },
      redirectToLogin: () => router.replace("/login"),
    });

    async function synchronizeSnapshot(
      snapshot: NonNullable<
        ReturnType<typeof getAuthSessionSnapshot>
      >,
      recoverPersistedTransition: boolean
    ) {
      if (
        snapshot.transition === "logout" ||
        snapshot.phase === "logged-out"
      ) {
        await terminateSession({
          remoteRevision: snapshot.revision,
        });
        return;
      }

      const reconciled = await reconcileAuthenticatedSession(
        snapshot.revision
      );

      if (!isActive || !reconciled) return;

      setAuthRevision(snapshot.revision);

      if (
        snapshot.phase === "transitioning" &&
        !recoverPersistedTransition
      ) {
        setCanValidateSession(false);
        return;
      }

      if (!tokenStorage.getRefreshToken()) {
        await terminateSession({
          expectedRevision: snapshot.revision,
        });
        return;
      }

      setCanValidateSession(true);
    }

    function enqueueSynchronization(
      snapshot: NonNullable<
        ReturnType<typeof getAuthSessionSnapshot>
      >,
      recoverPersistedTransition = false
    ) {
      synchronizationQueue = synchronizationQueue
        .then(() =>
          synchronizeSnapshot(
            snapshot,
            recoverPersistedTransition
          )
        )
        .catch(() => undefined);
    }

    const unsubscribe = subscribeToAuthSession(
      enqueueSynchronization
    );
    const snapshot = getAuthSessionSnapshot();
    const hasRefreshToken = Boolean(
      tokenStorage.getRefreshToken()
    );

    if (hasRefreshToken && !snapshot) {
      const initialized = initializeAuthenticatedSession();
      enqueueSynchronization(initialized, true);
    } else if (snapshot) {
      enqueueSynchronization(snapshot, true);
    } else {
      void terminateSession();
    }

    return () => {
      isActive = false;
      unsubscribe();
      unregister();
    };
  }, [queryClient, router]);

  const {
    data: user,
    dataUpdatedAt,
    error,
    isError,
    isPending,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: [...authQueryKeys.me, authRevision],
    queryFn: async () => {
      const revision = authRevision;
      const authenticatedUser = await userService.me();

      if (revision) {
        await promoteAuthenticatedSession(revision);
      }

      return authenticatedUser;
    },
    enabled:
      canValidateSession === true &&
      Boolean(authRevision),
    retry: false,
  });

  const isAuthenticationFailure =
    error instanceof HttpError && error.status === 401;

  useEffect(() => {
    if (isAuthenticationFailure) {
      void terminateSession({
        expectedRevision: authRevision ?? undefined,
      });
    }
  }, [authRevision, isAuthenticationFailure]);

  const memberships = useMemo(
    () => user?.memberships ?? [],
    [user?.memberships]
  );
  const userPublicId = user?.public_id;
  const isPlatformAdmin = user?.is_superuser === true;
  const membershipSignature = memberships
    .map(
      (membership) =>
        `${membership.membership_public_id}:${membership.business_public_id}:${membership.business_name}:${membership.role}:${membership.employee_public_id ?? ""}`
    )
    .join("|");

  useEffect(() => {
    if (!userPublicId) {
      setBusinessSelection(null);
      return;
    }

    if (isPlatformAdmin) {
      const platformBusinessPublicId =
        platformBusinessSelectionStorage.get(userPublicId);

      setBusinessSelection(
        platformBusinessPublicId
          ? {
              userPublicId,
              status: "resolved",
              businessPublicId: platformBusinessPublicId,
            }
          : {
              userPublicId,
              status: "selection-required",
            }
      );
      return;
    }

    platformBusinessSelectionStorage.remove(userPublicId);

    const preferredBusinessPublicId =
      membershipBusinessPreferenceStorage.get(userPublicId);
    const preferredMembership = memberships.find(
      (membership) =>
        membership.business_public_id === preferredBusinessPublicId
    );

    if (preferredMembership) {
      setBusinessSelection({
        userPublicId,
        status: "resolved",
        businessPublicId: preferredMembership.business_public_id,
      });
      return;
    }

    if (preferredBusinessPublicId) {
      membershipBusinessPreferenceStorage.remove(userPublicId);
    }

    if (memberships.length === 1) {
      const [onlyMembership] = memberships;
      membershipBusinessPreferenceStorage.set(
        userPublicId,
        onlyMembership.business_public_id
      );
      setBusinessSelection({
        userPublicId,
        status: "resolved",
        businessPublicId: onlyMembership.business_public_id,
      });
      return;
    }

    if (memberships.length > 1) {
      setBusinessSelection({
        userPublicId,
        status: "selection-required",
      });
      return;
    }

    setBusinessSelection({ userPublicId, status: "empty" });
  }, [
    dataUpdatedAt,
    isPlatformAdmin,
    membershipSignature,
    memberships,
    userPublicId,
  ]);

  useEffect(() => {
    if (!userPublicId || isPlatformAdmin) return;

    const storageKey = getActiveBusinessStorageKey(userPublicId);

    function handleStorage(event: StorageEvent) {
      if (event.key !== storageKey) return;

      if (event.newValue) {
        const isMembershipBusiness = memberships.some(
          (membership) =>
            membership.business_public_id === event.newValue
        );

        if (isMembershipBusiness) {
          setBusinessSelection({
            userPublicId: userPublicId!,
            status: "resolved",
            businessPublicId: event.newValue,
          });
          return;
        }

        membershipBusinessPreferenceStorage.remove(userPublicId!);
      }

      if (memberships.length === 1) {
        const [onlyMembership] = memberships;
        membershipBusinessPreferenceStorage.set(
          userPublicId!,
          onlyMembership.business_public_id
        );
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "resolved",
          businessPublicId: onlyMembership.business_public_id,
        });
      } else if (memberships.length > 1) {
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "selection-required",
        });
      } else {
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "empty",
        });
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isPlatformAdmin, membershipSignature, memberships, userPublicId]);

  const selectedBusinessPublicId =
    userPublicId &&
    businessSelection?.userPublicId === userPublicId &&
    businessSelection.status === "resolved"
      ? businessSelection.businessPublicId
      : undefined;
  const activeMembership =
    memberships.find(
      (membership) =>
        membership.business_public_id === selectedBusinessPublicId
    ) ?? null;
  const needsPlatformBusiness = Boolean(
    isPlatformAdmin && selectedBusinessPublicId && !activeMembership
  );
  const {
    data: platformBusiness,
    error: platformBusinessError,
    isError: isPlatformBusinessError,
    isPending: isPlatformBusinessPending,
    refetch: refetchPlatformBusiness,
  } = useQuery({
    queryKey: businessKeys.detail(selectedBusinessPublicId),
    queryFn: () => businessService.get(selectedBusinessPublicId!),
    enabled: needsPlatformBusiness,
    retry: false,
  });

  useEffect(() => {
    if (
      !needsPlatformBusiness ||
      !userPublicId ||
      !(platformBusinessError instanceof HttpError) ||
      ![403, 404].includes(platformBusinessError.status)
    ) {
      return;
    }

    platformBusinessSelectionStorage.remove(userPublicId);
    setBusinessSelection({
      userPublicId,
      status: "selection-required",
    });
  }, [needsPlatformBusiness, platformBusinessError, userPublicId]);

  const activeContext = useMemo<ActiveBusinessContext | null>(() => {
    if (activeMembership) {
      return { source: "membership", ...activeMembership };
    }

    if (needsPlatformBusiness && platformBusiness) {
      return {
        source: "platform",
        business_public_id: platformBusiness.public_id,
        business_name: platformBusiness.business_name,
        membership_public_id: null,
        role: null,
        employee_public_id: null,
      };
    }

    return null;
  }, [activeMembership, needsPlatformBusiness, platformBusiness]);

  const businessStatus: BusinessStatus =
    !userPublicId ||
    businessSelection?.userPublicId !== userPublicId ||
    (needsPlatformBusiness && isPlatformBusinessPending)
      ? "resolving"
      : needsPlatformBusiness && isPlatformBusinessError
        ? "verification-error"
        : businessSelection.status;

  const selectMembership = useCallback(
    (membershipPublicId: string) => {
      if (!userPublicId || isPlatformAdmin) return false;

      const membership = memberships.find(
        (candidate) =>
          candidate.membership_public_id === membershipPublicId
      );
      if (!membership) return false;

      membershipBusinessPreferenceStorage.set(
        userPublicId,
        membership.business_public_id
      );
      setBusinessSelection({
        userPublicId,
        status: "resolved",
        businessPublicId: membership.business_public_id,
      });
      return true;
    },
    [isPlatformAdmin, memberships, userPublicId]
  );

  const selectBusiness = useCallback(
    (business: Business) => {
      if (!userPublicId || !isPlatformAdmin) return false;

      queryClient.setQueryData(
        businessKeys.detail(business.public_id),
        business
      );
      platformBusinessSelectionStorage.set(
        userPublicId,
        business.public_id
      );
      setBusinessSelection({
        userPublicId,
        status: "resolved",
        businessPublicId: business.public_id,
      });
      return true;
    },
    [isPlatformAdmin, queryClient, userPublicId]
  );

  const status: AuthContextValue["status"] =
    canValidateSession !== true || isPending || isAuthenticationFailure
      ? "checking"
      : isSuccess
        ? "authenticated"
        : "error";

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      memberships,
      activeContext,
      activeMembership,
      activeBusiness: activeContext
        ? {
            public_id: activeContext.business_public_id,
            name: activeContext.business_name,
          }
        : null,
      activeBusinessPublicId: activeContext?.business_public_id,
      role: activeMembership?.role ?? null,
      employeePublicId: activeMembership?.employee_public_id ?? null,
      isPlatformAdmin,
      businessStatus,
      businessVerificationError: platformBusinessError ?? null,
      selectMembership,
      selectBusiness,
      retryBusinessVerification: () => {
        void refetchPlatformBusiness();
      },
      status,
      error: isError ? error : null,
      retry: () => {
        void refetch();
      },
      isLoading: status === "checking",
      isAuthenticated: status === "authenticated",
    }),
    [
      activeContext,
      activeMembership,
      businessStatus,
      error,
      isError,
      isPlatformAdmin,
      memberships,
      platformBusinessError,
      refetchPlatformBusiness,
      refetch,
      selectBusiness,
      selectMembership,
      status,
      user,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}
