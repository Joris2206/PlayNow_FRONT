"use client";

import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee-service";

type UseEmployeesParams = {
  businessPublicId?: string;
  page: number;
  pageSize: number;
};

export const employeeKeys = {
  all: ["employees"] as const,
  byBusiness(businessPublicId: string | undefined) {
    return [...this.all, businessPublicId] as const;
  },
  list(params: UseEmployeesParams) {
    return [...this.byBusiness(params.businessPublicId), params.page, params.pageSize] as const;
  },
};

export function useEmployees(params: UseEmployeesParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.list({
      business_public_id: params.businessPublicId!,
      page: params.page,
      page_size: params.pageSize,
    }),
    enabled: Boolean(params.businessPublicId),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === params.businessPublicId ? previousData : undefined,
  });
}
