"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";

import { useCloseCashRegister } from "@/hooks/use-cash-registers";
import { toMoneyMinorUnits } from "@/components/sales/sales-format";

import {
  CASH_MONEY_INPUT_PATTERN,
  formatCashMoney,
  getCashErrorMessage,
} from "@/components/cash/cash-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type {
  CashRegister,
  CashRegisterClosingPreview,
} from "@/types/cash";

type CloseCashRegisterDialogProps = {
  businessPublicId?: string;
  cashRegister: CashRegister | null;
  preview?: CashRegisterClosingPreview;
  previewLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshPreview: () => Promise<boolean>;
};

export default function CloseCashRegisterDialog({
  businessPublicId,
  cashRegister,
  preview,
  previewLoading,
  open,
  onOpenChange,
  refreshPreview,
}: CloseCashRegisterDialogProps) {
  const [closingBalance, setClosingBalance] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] =
    useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const closeCashRegister = useCloseCashRegister();
  const resetCloseCashRegister = closeCashRegister.reset;

  useEffect(() => {
    if (!open) {
      return;
    }

    setClosingBalance("");
    setClosingNotes("");
    setAttemptedSubmit(false);
    setRefreshError(false);
    resetCloseCashRegister();
  }, [
    businessPublicId,
    cashRegister?.public_id,
    open,
    resetCloseCashRegister,
  ]);

  const closingBalanceMinor =
    toMoneyMinorUnits(closingBalance);
  const validClosingBalance =
    closingBalanceMinor !== null &&
    closingBalanceMinor >= 0n;
  const canSubmit = Boolean(
    businessPublicId &&
      cashRegister &&
      preview &&
      validClosingBalance
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && closeCashRegister.isPending) {
      return;
    }

    if (!nextOpen) {
      resetCloseCashRegister();
    }

    onOpenChange(nextOpen);
  }

  async function handleRefreshPreview() {
    setRefreshError(false);

    if (!(await refreshPreview())) {
      setRefreshError(true);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (
      !canSubmit ||
      !businessPublicId ||
      !cashRegister ||
      closeCashRegister.isPending
    ) {
      return;
    }

    setRefreshError(false);
    const previewRefreshed = await refreshPreview();

    if (!previewRefreshed) {
      setRefreshError(true);
      return;
    }

    try {
      await closeCashRegister.mutateAsync({
        businessPublicId,
        publicId: cashRegister.public_id,
        data: {
          closing_balance: closingBalance,
          ...(closingNotes.trim()
            ? { closing_notes: closingNotes.trim() }
            : {}),
        },
      });

      onOpenChange(false);
    } catch {
      // Keep the dialog open with the backend validation error.
    }
  }

  const errorMessage = closeCashRegister.error
    ? getCashErrorMessage(
        closeCashRegister.error,
        "No fue posible cerrar la caja."
      )
    : null;

  if (!cashRegister) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Cuenta el efectivo físico. PlayNow API recalculará y guardará el saldo esperado y la diferencia definitivos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Saldo esperado autoritativo
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {preview
                    ? formatCashMoney(
                        preview.expected_closing_balance,
                        cashRegister.business_currency
                      )
                    : "No disponible"}
                </p>
              </div>
              {previewLoading && (
                <RefreshCw className="h-5 w-5 animate-spin text-zinc-500" />
              )}
            </div>

            {!preview && !previewLoading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleRefreshPreview()}
                className="mt-3 px-0 text-red-400 hover:bg-transparent hover:text-red-300"
              >
                <RefreshCw className="h-4 w-4" />
                Volver a consultar
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cash-closing-balance" className="text-sm font-medium text-zinc-300">
              Efectivo real contado
            </label>
            <Input
              id="cash-closing-balance"
              type="text"
              inputMode="decimal"
              value={closingBalance}
              onChange={(event) => {
                if (CASH_MONEY_INPUT_PATTERN.test(event.target.value)) {
                  setClosingBalance(event.target.value);
                }
              }}
              disabled={closeCashRegister.isPending}
              aria-invalid={attemptedSubmit && !validClosingBalance}
              placeholder="0.00"
              className="h-11 border-white/10 bg-black/30 text-white"
            />
            {attemptedSubmit && !validClosingBalance && (
              <p className="text-xs text-red-400">
                Ingresa un saldo mayor o igual a cero, con máximo dos decimales.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cash-closing-notes" className="text-sm font-medium text-zinc-300">
              Notas <span className="font-normal text-zinc-600">(opcional)</span>
            </label>
            <textarea
              id="cash-closing-notes"
              value={closingNotes}
              onChange={(event) => setClosingNotes(event.target.value)}
              disabled={closeCashRegister.isPending}
              rows={3}
              className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20"
            />
          </div>

          {refreshError && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              No se pudo actualizar la vista previa. La caja no fue cerrada.
            </div>
          )}

          {errorMessage && (
            <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={closeCashRegister.isPending} className="border-white/10 bg-transparent text-white">
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={!canSubmit || closeCashRegister.isPending || previewLoading}>
              {closeCashRegister.isPending ? (
                <><LoaderCircle className="h-4 w-4 animate-spin" />Cerrando...</>
              ) : (
                "Cerrar caja"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
