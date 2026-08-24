"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cashMovementKeys,
  cashRegisterKeys,
  type CashMovementKeyParams,
} from "@/hooks/cash-query-keys";
import { cashMovementService } from "@/services/cash-movement-service";

import type { CreateCashMovementRequest } from "@/types/cash";

export { cashMovementKeys } from "@/hooks/cash-query-keys";

export function useCashMovements(
  params: CashMovementKeyParams
) {
  return useQuery({
    queryKey: cashMovementKeys.list(params),
    queryFn: () =>
      cashMovementService.list({
        business_public_id: params.businessPublicId!,
        cash_register_public_id:
          params.cashRegisterPublicId!,
        employee_public_id: params.employeePublicId,
        payment_method_public_id:
          params.paymentMethodPublicId,
        movement_type: params.movementType,
        page: params.page,
        page_size: params.pageSize,
        ordering: params.ordering,
      }),
    enabled: Boolean(
      params.businessPublicId &&
        params.cashRegisterPublicId
    ),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] ===
        params.businessPublicId &&
      previousQuery?.queryKey[3] ===
        params.cashRegisterPublicId
        ? previousData
        : undefined,
  });
}

type CreateCashMovementVariables = {
  businessPublicId: string;
  data: CreateCashMovementRequest;
};

export function useCreateCashMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: CreateCashMovementVariables) =>
      cashMovementService.create(data),
    retry: false,
    onSuccess: (_movement, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: cashMovementKeys.byRegister(
            variables.businessPublicId,
            variables.data.cash_register_public_id
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: cashRegisterKeys.preview(
            variables.businessPublicId,
            variables.data.cash_register_public_id
          ),
        }),
      ]),
  });
}
