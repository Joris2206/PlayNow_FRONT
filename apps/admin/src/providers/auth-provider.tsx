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

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authQueryKeys } from "@/lib/auth-query-keys";
import {
  businessSelectionStorage,
  getActiveBusinessStorageKey,
} from "@/lib/business-selection-storage";
import { HttpError } from "@/lib/http";
import {
  registerSessionTerminationCoordinator,
  terminateSession,
} from "@/lib/session";
import { tokenStorage } from "@/lib/token-storage";
import { userService } from "@/services/user-service";

import type {
  AuthUser,
  BusinessMembership,
} from "@/types/user";

type BusinessStatus =
  | "resolving"
  | "resolved"
  | "selection-required"
  | "empty";

type AuthContextValue = {
  user: AuthUser | null;
  memberships: BusinessMembership[];
  activeMembership: BusinessMembership | null;
  activeBusiness: {
    public_id: string;
    name: string;
  } | null;
  activeBusinessPublicId: string | null;
  role: BusinessMembership["role"] | null;
  employeePublicId: string | null;
  businessStatus: BusinessStatus;
  selectMembership: (
    membershipPublicId: string
  ) => boolean;
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

const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [canValidateSession, setCanValidateSession] =
    useState<boolean | null>(null);
  const [businessSelection, setBusinessSelection] =
    useState<BusinessSelectionState | null>(null);

  useEffect(() => {
    const coordinator = {
      cancelQueries: () => queryClient.cancelQueries(),

      clearCache: () => {
        queryClient.clear();
        setCanValidateSession(false);
        setBusinessSelection(null);
      },

      redirectToLogin: () => {
        router.replace("/login");
      },
    };

    const unregister =
      registerSessionTerminationCoordinator(coordinator);

    if (tokenStorage.getRefreshToken()) {
      setCanValidateSession(true);
    } else {
      void terminateSession();
    }

    return unregister;
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
    queryKey: authQueryKeys.me,
    queryFn: userService.me,
    enabled: canValidateSession === true,
    retry: false,
  });

  const isAuthenticationFailure =
    error instanceof HttpError && error.status === 401;

  useEffect(() => {
    if (isAuthenticationFailure) {
      void terminateSession();
    }
  }, [isAuthenticationFailure]);

  const memberships = useMemo(
    () => user?.memberships ?? [],
    [user?.memberships]
  );
  const userPublicId = user?.public_id;
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

    const preferredBusinessPublicId =
      businessSelectionStorage.get(userPublicId);
    const preferredMembership = memberships.find(
      (membership) =>
        membership.business_public_id ===
        preferredBusinessPublicId
    );

    if (preferredMembership) {
      setBusinessSelection({
        userPublicId,
        status: "resolved",
        businessPublicId:
          preferredMembership.business_public_id,
      });
      return;
    }

    if (preferredBusinessPublicId) {
      businessSelectionStorage.remove(userPublicId);
    }

    if (memberships.length === 0) {
      setBusinessSelection({
        userPublicId,
        status: "empty",
      });
      return;
    }

    if (memberships.length === 1) {
      const [onlyMembership] = memberships;

      businessSelectionStorage.set(
        userPublicId,
        onlyMembership.business_public_id
      );
      setBusinessSelection({
        userPublicId,
        status: "resolved",
        businessPublicId:
          onlyMembership.business_public_id,
      });
      return;
    }

    setBusinessSelection({
      userPublicId,
      status: "selection-required",
    });
  }, [
    dataUpdatedAt,
    membershipSignature,
    memberships,
    userPublicId,
  ]);

  useEffect(() => {
    if (!userPublicId) return;

    const storageKey =
      getActiveBusinessStorageKey(userPublicId);

    function handleStorage(event: StorageEvent) {
      if (event.key !== storageKey) return;

      const nextMembership = memberships.find(
        (membership) =>
          membership.business_public_id ===
          event.newValue
      );

      if (nextMembership) {
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "resolved",
          businessPublicId:
            nextMembership.business_public_id,
        });
        return;
      }

      if (event.newValue) {
        businessSelectionStorage.remove(userPublicId!);
      }

      if (memberships.length === 0) {
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "empty",
        });
      } else if (memberships.length === 1) {
        const [onlyMembership] = memberships;

        businessSelectionStorage.set(
          userPublicId!,
          onlyMembership.business_public_id
        );
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "resolved",
          businessPublicId:
            onlyMembership.business_public_id,
        });
      } else {
        setBusinessSelection({
          userPublicId: userPublicId!,
          status: "selection-required",
        });
      }
    }

    window.addEventListener("storage", handleStorage);
    return () =>
      window.removeEventListener("storage", handleStorage);
  }, [membershipSignature, memberships, userPublicId]);

  const activeMembership =
    userPublicId &&
    businessSelection?.userPublicId === userPublicId &&
    businessSelection.status === "resolved"
      ? memberships.find(
          (membership) =>
            membership.business_public_id ===
            businessSelection.businessPublicId
        ) ?? null
      : null;

  const businessStatus: BusinessStatus =
    !userPublicId ||
    businessSelection?.userPublicId !== userPublicId
      ? "resolving"
      : businessSelection.status === "resolved" &&
          !activeMembership
        ? "resolving"
        : businessSelection.status;

  const selectMembership = useCallback(
    (membershipPublicId: string) => {
      if (!userPublicId) return false;

      const membership = memberships.find(
        (candidate) =>
          candidate.membership_public_id ===
          membershipPublicId
      );

      if (!membership) return false;

      businessSelectionStorage.set(
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
    [memberships, userPublicId]
  );

  const status: AuthContextValue["status"] =
    canValidateSession !== true ||
    isPending ||
    isAuthenticationFailure
      ? "checking"
      : isSuccess
        ? "authenticated"
        : "error";

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      memberships,
      activeMembership,
      activeBusiness: activeMembership
        ? {
            public_id:
              activeMembership.business_public_id,
            name: activeMembership.business_name,
          }
        : null,
      activeBusinessPublicId:
        activeMembership?.business_public_id ?? null,
      role: activeMembership?.role ?? null,
      employeePublicId:
        activeMembership?.employee_public_id ?? null,
      businessStatus,
      selectMembership,
      status,
      error: isError ? error : null,
      retry: () => {
        void refetch();
      },
      isLoading: status === "checking",
      isAuthenticated: status === "authenticated",
    }),
    [
      activeMembership,
      businessStatus,
      error,
      isError,
      memberships,
      refetch,
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
