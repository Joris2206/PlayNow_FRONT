"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

import type {
  AuthUser,
  BusinessMembership,
} from "@/types/user";

type AuthContextValue = {
  user: AuthUser | null;
  activeMembership: BusinessMembership | null;
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
  const {
    data: user,
    isLoading,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: userService.me,
    retry: false,
  });

  // Por ahora usamos la primera membresía.
  // Más adelante podemos permitir cambiar de negocio.
  const activeMembership =
    user?.memberships?.[0] ?? null;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        activeMembership,
        isLoading,
        isAuthenticated: Boolean(user),
      }}
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