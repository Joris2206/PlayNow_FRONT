"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { employeeService } from "@/services/employee-service";

import type {
  CreateEmployeeRequest,
  EmployeeOrdering,
  UpdateEmployeeRequest,
} from "@/types/employee";

type UseEmployeesParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
  search?: string;
  ordering?: EmployeeOrdering;
  statusPublicId?: string;
};

export const employeeKeys = {
  all: ["employees"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  selectors(params: UseEmployeesParams) {
    return [
      ...this.byBusiness(params.businessPublicId),
      "selectors",
      params.page,
      params.pageSize,
      params.search,
      params.ordering,
      params.statusPublicId,
    ] as const;
  },
  admin(params: UseEmployeesParams) {
    return [
      ...this.byBusiness(params.businessPublicId),
      "admin",
      params.page,
      params.pageSize,
      params.search,
      params.ordering,
      params.statusPublicId,
    ] as const;
  },
};

function toListParams(params: UseEmployeesParams) {
  return {
    business_public_id: params.businessPublicId!,
    page: params.page,
    page_size: params.pageSize,
    search: params.search,
    ordering: params.ordering,
    status_public_id: params.statusPublicId,
  };
}

export function useEmployees(params: UseEmployeesParams) {
  return useQuery({
    queryKey: employeeKeys.selectors(params),
    queryFn: () => employeeService.list(toListParams(params)),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId ? previousData : undefined,
  });
}

export function useAdminEmployees(params: UseEmployeesParams) {
  return useQuery({
    queryKey: employeeKeys.admin(params),
    queryFn: () => employeeService.listAdmin(toListParams(params)),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId
        ? previousData
        : undefined,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) =>
      employeeService.create(data),
    onSuccess: (_employee, variables) =>
      queryClient.invalidateQueries({
        queryKey: employeeKeys.byBusiness(
          variables.business_public_id
        ),
      }),
  });
}

type UpdateEmployeeVariables = {
  publicId: string;
  businessPublicId: string;
  data: UpdateEmployeeRequest;
};

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: UpdateEmployeeVariables) =>
      employeeService.update(publicId, data),
    onSuccess: (_employee, variables) =>
      queryClient.invalidateQueries({
        queryKey: employeeKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
  });
}

type DeleteEmployeeVariables = {
  publicId: string;
  businessPublicId: string;
};

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }: DeleteEmployeeVariables) =>
      employeeService.delete(publicId),
    onSuccess: (_result, variables) =>
      queryClient.invalidateQueries({
        queryKey: employeeKeys.byBusiness(
          variables.businessPublicId
        ),
      }),
  });
}
