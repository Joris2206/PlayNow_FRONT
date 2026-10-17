import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";

import type { PaginatedResponse } from "@/types/api";
import type {
  AddExistingBusinessMemberRequest,
  BusinessMembershipListItem,
  BusinessMembershipListParams,
  BusinessMembershipMutationResult,
  CreateBusinessUserRequest,
  CreateBusinessUserResponse,
  PromoteBusinessOwnerRequest,
  RemoveBusinessOwnerRequest,
  TransferBusinessOwnershipRequest,
  TransferBusinessOwnershipResponse,
  UpdateBusinessMembershipRequest,
} from "@/types/business-membership";

export const businessMembershipService = {
  list(
    params: BusinessMembershipListParams
  ): Promise<PaginatedResponse<BusinessMembershipListItem>> {
    const query = buildQueryString({
      business_public_id: params.business_public_id,
      page: params.page,
      page_size: params.page_size,
      search: params.search,
      ordering: params.ordering,
      role: params.role,
      is_active: params.is_active,
      employee_status_public_id: params.employee_status_public_id,
    });

    return http.get<PaginatedResponse<BusinessMembershipListItem>>(
      `/api/business-memberships/${query}`
    );
  },

  async listAll(
    params: Omit<BusinessMembershipListParams, "page" | "page_size">
  ): Promise<BusinessMembershipListItem[]> {
    const results: BusinessMembershipListItem[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.list({
        ...params,
        page,
        page_size: 50,
      });
      results.push(...response.results);
      totalPages = response.total_pages;
      page += 1;
    } while (page <= totalPages);

    return results;
  },

  addExisting(
    businessPublicId: string,
    data: AddExistingBusinessMemberRequest
  ): Promise<BusinessMembershipMutationResult> {
    return http.post<BusinessMembershipMutationResult>(
      `/api/businesses/${businessPublicId}/members/`,
      data
    );
  },

  createUser(
    businessPublicId: string,
    data: CreateBusinessUserRequest
  ): Promise<CreateBusinessUserResponse> {
    return http.post<CreateBusinessUserResponse>(
      `/api/businesses/${businessPublicId}/users/`,
      data
    );
  },

  update(
    membershipPublicId: string,
    data: UpdateBusinessMembershipRequest
  ): Promise<BusinessMembershipMutationResult> {
    return http.patch<BusinessMembershipMutationResult>(
      `/api/business-memberships/${membershipPublicId}/`,
      data
    );
  },

  deactivate(membershipPublicId: string): Promise<void> {
    return http.delete<void>(
      `/api/business-memberships/${membershipPublicId}/`
    );
  },

  promoteOwner(
    businessPublicId: string,
    data: PromoteBusinessOwnerRequest
  ): Promise<BusinessMembershipMutationResult> {
    return http.post<BusinessMembershipMutationResult>(
      `/api/businesses/${businessPublicId}/owners/`,
      data
    );
  },

  transferOwnership(
    businessPublicId: string,
    data: TransferBusinessOwnershipRequest
  ): Promise<TransferBusinessOwnershipResponse> {
    return http.post<TransferBusinessOwnershipResponse>(
      `/api/businesses/${businessPublicId}/ownership-transfer/`,
      data
    );
  },

  removeOwner(
    businessPublicId: string,
    membershipPublicId: string,
    data: RemoveBusinessOwnerRequest
  ): Promise<BusinessMembershipMutationResult> {
    return http.post<BusinessMembershipMutationResult>(
      `/api/businesses/${businessPublicId}/owners/${membershipPublicId}/remove/`,
      data
    );
  },
};
