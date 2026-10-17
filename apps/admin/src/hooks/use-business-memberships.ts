"use client";

import { useRef } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authQueryKeys } from "@/lib/auth-query-keys";
import { HttpError } from "@/lib/http";
import { businessKeys } from "@/hooks/use-businesses";
import { businessMembershipService } from "@/services/business-membership-service";

import type {
  AddExistingBusinessMemberRequest,
  BusinessMembershipListParams,
  CreateBusinessUserRequest,
  NonOwnerRole,
  UpdateBusinessMembershipRequest,
} from "@/types/business-membership";

type UseBusinessMembershipsParams = Omit<
  BusinessMembershipListParams,
  "business_public_id"
> & {
  businessPublicId?: string;
};

export const businessMembershipKeys = {
  all: ["business-memberships"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  list(params: UseBusinessMembershipsParams) {
    return [
      ...this.byBusiness(params.businessPublicId),
      "list",
      params.page,
      params.page_size,
      params.search,
      params.ordering,
      params.role,
      params.is_active,
      params.employee_status_public_id,
    ] as const;
  },
  owners(businessPublicId: string | undefined) {
    return [...this.byBusiness(businessPublicId), "owners"] as const;
  },
  ownershipCandidates(businessPublicId: string | undefined) {
    return [
      ...this.byBusiness(businessPublicId),
      "ownership-candidates",
    ] as const;
  },
};

export function useBusinessMemberships(
  params: UseBusinessMembershipsParams
) {
  return useQuery({
    queryKey: businessMembershipKeys.list(params),
    queryFn: () =>
      businessMembershipService.list({
        business_public_id: params.businessPublicId!,
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        ordering: params.ordering,
        role: params.role,
        is_active: params.is_active,
        employee_status_public_id: params.employee_status_public_id,
      }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId
        ? previousData
        : undefined,
  });
}

export function useBusinessOwners(
  businessPublicId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: businessMembershipKeys.owners(businessPublicId),
    queryFn: () =>
      businessMembershipService.listAll({
        business_public_id: businessPublicId!,
        role: "owner",
        ordering: "created_at",
      }),
    enabled: Boolean(businessPublicId) && enabled,
  });
}

export function useOwnershipCandidates(
  businessPublicId: string | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: businessMembershipKeys.ownershipCandidates(businessPublicId),
    queryFn: () =>
      businessMembershipService.listAll({
        business_public_id: businessPublicId!,
        is_active: true,
        ordering: "user_full_name",
      }),
    enabled: Boolean(businessPublicId) && enabled,
  });
}

async function refreshMembershipContext(
  queryClient: ReturnType<typeof useQueryClient>,
  businessPublicId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: businessMembershipKeys.byBusiness(businessPublicId),
    }),
    queryClient.invalidateQueries({
      queryKey: authQueryKeys.me,
      refetchType: "active",
    }),
  ]);
}

async function refreshOwnershipContext(
  queryClient: ReturnType<typeof useQueryClient>,
  businessPublicId: string
) {
  await Promise.all([
    refreshMembershipContext(queryClient, businessPublicId),
    queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  ]);
}

function refreshOwnershipAfterConflict(
  queryClient: ReturnType<typeof useQueryClient>,
  error: unknown,
  businessPublicId: string
) {
  if (
    !(error instanceof HttpError) ||
    ![403, 404, 409].includes(error.status)
  ) {
    return;
  }

  return refreshOwnershipContext(queryClient, businessPublicId);
}

function refreshMembershipsAfterConflict(
  queryClient: ReturnType<typeof useQueryClient>,
  error: unknown,
  businessPublicId: string
) {
  if (
    !(error instanceof HttpError) ||
    ![403, 404, 409].includes(error.status)
  ) {
    return;
  }

  const invalidations = [
    queryClient.invalidateQueries({
      queryKey: businessMembershipKeys.byBusiness(businessPublicId),
    }),
  ];

  if ([403, 404].includes(error.status)) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.me,
        refetchType: "active",
      })
    );
  }

  return Promise.all(invalidations);
}

type AddExistingVariables = {
  businessPublicId: string;
  data: AddExistingBusinessMemberRequest;
};

export function useAddExistingBusinessMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessPublicId, data }: AddExistingVariables) =>
      businessMembershipService.addExisting(businessPublicId, data),
    onSuccess: (_membership, variables) =>
      refreshMembershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshMembershipsAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });
}

type CreateUserMutationVariables = {
  businessPublicId: string;
};

type CreateUserVariables = CreateUserMutationVariables & {
  data: CreateBusinessUserRequest;
};

export function useCreateBusinessUser() {
  const queryClient = useQueryClient();
  const requestRef = useRef<CreateBusinessUserRequest | null>(null);
  const mutation = useMutation({
    mutationFn: ({ businessPublicId }: CreateUserMutationVariables) => {
      const request = requestRef.current;
      if (!request) {
        throw new Error("No hay datos disponibles para crear el usuario.");
      }
      return businessMembershipService.createUser(businessPublicId, request);
    },
    onSuccess: (_membership, variables) =>
      refreshMembershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshMembershipsAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });

  async function create({ businessPublicId, data }: CreateUserVariables) {
    requestRef.current = data;
    try {
      return await mutation.mutateAsync({ businessPublicId });
    } finally {
      requestRef.current = null;
    }
  }

  return { ...mutation, create };
}

type UpdateMembershipVariables = {
  businessPublicId: string;
  membershipPublicId: string;
  data: UpdateBusinessMembershipRequest;
};

export function useUpdateBusinessMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      membershipPublicId,
      data,
    }: UpdateMembershipVariables) =>
      businessMembershipService.update(membershipPublicId, data),
    onSuccess: (_membership, variables) =>
      refreshMembershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshMembershipsAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });
}

type DeactivateMembershipVariables = {
  businessPublicId: string;
  membershipPublicId: string;
};

export function useDeactivateBusinessMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipPublicId }: DeactivateMembershipVariables) =>
      businessMembershipService.deactivate(membershipPublicId),
    onSuccess: (_result, variables) =>
      refreshMembershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshMembershipsAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });
}

type PromoteOwnerVariables = {
  businessPublicId: string;
  membershipPublicId: string;
};

export function usePromoteBusinessOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessPublicId, membershipPublicId }: PromoteOwnerVariables) =>
      businessMembershipService.promoteOwner(businessPublicId, {
        membership_public_id: membershipPublicId,
      }),
    onSuccess: (_membership, variables) =>
      refreshOwnershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshOwnershipAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });
}

type TransferOwnershipVariables = {
  businessPublicId: string;
  fromMembershipPublicId: string;
  toMembershipPublicId: string;
  fromRole: NonOwnerRole;
};

export function useTransferBusinessOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessPublicId,
      fromMembershipPublicId,
      toMembershipPublicId,
      fromRole,
    }: TransferOwnershipVariables) =>
      businessMembershipService.transferOwnership(businessPublicId, {
        from_membership_public_id: fromMembershipPublicId,
        to_membership_public_id: toMembershipPublicId,
        from_role: fromRole,
      }),
    onSuccess: (_memberships, variables) =>
      refreshOwnershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshOwnershipAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });
}

type RemoveOwnerVariables = {
  businessPublicId: string;
  membershipPublicId: string;
  replacementRole: NonOwnerRole;
};

export function useRemoveBusinessOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessPublicId,
      membershipPublicId,
      replacementRole,
    }: RemoveOwnerVariables) =>
      businessMembershipService.removeOwner(
        businessPublicId,
        membershipPublicId,
        { replacement_role: replacementRole }
      ),
    onSuccess: (_membership, variables) =>
      refreshOwnershipContext(queryClient, variables.businessPublicId),
    onError: (error, variables) =>
      refreshOwnershipAfterConflict(
        queryClient,
        error,
        variables.businessPublicId
      ),
    retry: false,
  });
}
