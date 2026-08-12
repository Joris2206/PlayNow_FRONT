"use client";

import {
  createContext,
  useEffect,
  useContext,
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

type AuthContextValue = {
  user: AuthUser | null;
  activeMembership: BusinessMembership | null;
  status: "checking" | "authenticated" | "error";
  error: Error | null;
  retry: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
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

  useEffect(() => {
    const coordinator = {
      cancelQueries: () =>
        queryClient.cancelQueries(),

      clearCache: () => {
        queryClient.clear();
        setCanValidateSession(false);
      },

      redirectToLogin: () => {
        router.replace("/login");
      },
    };

    const unregister =
      registerSessionTerminationCoordinator(
        coordinator
      );

    if (tokenStorage.getRefreshToken()) {
      setCanValidateSession(true);
    } else {
      void terminateSession();
    }

    return unregister;
  }, [queryClient, router]);

  const {
    data: user,
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
    error instanceof HttpError &&
    error.status === 401;

  useEffect(() => {
    if (isAuthenticationFailure) {
      void terminateSession();
    }
  }, [isAuthenticationFailure]);

  // Por ahora usamos la primera membresía.
  // Más adelante podemos permitir cambiar de negocio.
  const activeMembership =
    user?.memberships?.[0] ?? null;

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
      activeMembership,
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
      error,
      isError,
      refetch,
      status,
      user,
    ]
  );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
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
