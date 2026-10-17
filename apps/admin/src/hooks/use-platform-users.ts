"use client";

import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "@/lib/auth-query-keys";
import { HttpError } from "@/lib/http";
import { platformUserService } from "@/services/platform-user-service";

import type {
  PlatformUserListParams,
  ResetPlatformUserPasswordRequest,
  UpdatePlatformUserRequest,
} from "@/types/platform-user";

export const platformUserKeys = {
  all: ["platform-users"] as const,
  lists: ["platform-users", "list"] as const,
  list(params: PlatformUserListParams) {
    return [
      ...this.lists,
      params.page,
      params.page_size,
      params.search,
      params.ordering,
      params.is_active,
      params.is_superuser,
    ] as const;
  },
  details: ["platform-users", "detail"] as const,
  detail(publicId: string | undefined) {
    return [...this.details, publicId] as const;
  },
};

export function usePlatformUsers(params: PlatformUserListParams, enabled = true) {
  return useQuery({
    queryKey: platformUserKeys.list(params),
    queryFn: () => platformUserService.list(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function usePlatformUser(publicId?: string, enabled = true) {
  return useQuery({
    queryKey: platformUserKeys.detail(publicId),
    queryFn: () => platformUserService.get(publicId!),
    enabled: Boolean(publicId) && enabled,
  });
}

async function refreshPlatformUser(
  queryClient: ReturnType<typeof useQueryClient>,
  publicId: string,
  refreshMe = false
) {
  const invalidations: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: platformUserKeys.lists }),
    queryClient.invalidateQueries({
      queryKey: platformUserKeys.detail(publicId),
    }),
  ];

  if (refreshMe) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.me,
        refetchType: "active",
      })
    );
  }

  await Promise.all(invalidations);
}

function refreshPlatformUserAfterConflict(
  queryClient: ReturnType<typeof useQueryClient>,
  error: unknown,
  publicId: string
) {
  if (
    !(error instanceof HttpError) ||
    ![403, 404, 409].includes(error.status)
  ) {
    return;
  }

  const invalidations: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: platformUserKeys.lists }),
    queryClient.invalidateQueries({
      queryKey: platformUserKeys.detail(publicId),
    }),
  ];

  if (error.status === 403) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.me,
        refetchType: "active",
      })
    );
  }

  return Promise.all(invalidations);
}

type UserMutationVariables = {
  publicId: string;
  isCurrentUser?: boolean;
};

type UpdateVariables = UserMutationVariables & {
  data: UpdatePlatformUserRequest;
};

export function useUpdatePlatformUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: UpdateVariables) =>
      platformUserService.update(publicId, data),
    onSuccess: (_user, variables) =>
      refreshPlatformUser(
        queryClient,
        variables.publicId,
        variables.isCurrentUser
      ),
    onError: (error, variables) =>
      refreshPlatformUserAfterConflict(
        queryClient,
        error,
        variables.publicId
      ),
    retry: false,
  });
}

export function useActivatePlatformUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }: UserMutationVariables) =>
      platformUserService.activate(publicId),
    onSuccess: (_user, variables) =>
      refreshPlatformUser(
        queryClient,
        variables.publicId,
        variables.isCurrentUser
      ),
    onError: (error, variables) =>
      refreshPlatformUserAfterConflict(
        queryClient,
        error,
        variables.publicId
      ),
    retry: false,
  });
}

export function useDeactivatePlatformUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }: UserMutationVariables) =>
      platformUserService.deactivate(publicId),
    onSuccess: (_user, variables) =>
      refreshPlatformUser(queryClient, variables.publicId),
    onError: (error, variables) =>
      refreshPlatformUserAfterConflict(
        queryClient,
        error,
        variables.publicId
      ),
    retry: false,
  });
}

export function useRevokePlatformUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }: UserMutationVariables) =>
      platformUserService.revokeSessions(publicId),
    onSuccess: (_result, variables) =>
      refreshPlatformUser(queryClient, variables.publicId),
    onError: (error, variables) =>
      refreshPlatformUserAfterConflict(
        queryClient,
        error,
        variables.publicId
      ),
    retry: false,
  });
}

type ResetPasswordMutationVariables = {
  publicId: string;
};

export function useResetPlatformUserPassword() {
  const queryClient = useQueryClient();
  const requestRef = useRef<ResetPlatformUserPasswordRequest | null>(null);
  const mutation = useMutation({
    mutationFn: ({ publicId }: ResetPasswordMutationVariables) => {
      const request = requestRef.current;
      if (!request) {
        throw new Error("No hay una contraseña disponible para enviar.");
      }
      return platformUserService.resetPassword(publicId, request);
    },
    onSuccess: (_result, variables) =>
      refreshPlatformUser(queryClient, variables.publicId),
    onError: (error, variables) =>
      refreshPlatformUserAfterConflict(
        queryClient,
        error,
        variables.publicId
      ),
    retry: false,
  });

  async function resetPassword(
    publicId: string,
    data: ResetPlatformUserPasswordRequest
  ) {
    requestRef.current = data;
    try {
      return await mutation.mutateAsync({ publicId });
    } finally {
      requestRef.current = null;
    }
  }

  return { ...mutation, resetPassword };
}
