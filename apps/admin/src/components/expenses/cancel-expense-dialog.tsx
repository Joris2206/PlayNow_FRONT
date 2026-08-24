"use client";

import { LoaderCircle } from "lucide-react";

import {
  useCancelExpense,
  useRefreshExpenseEffects,
} from "@/hooks/use-transactions";
import { HttpError } from "@/lib/http";

import { getExpenseErrorMessage } from "@/components/expenses/expenses-format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Transaction } from "@/types/transaction";

type CancelExpenseDialogProps = {
  transaction: Transaction | null;
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CancelExpenseDialog({
  transaction,
  businessPublicId,
  open,
  onOpenChange,
}: CancelExpenseDialogProps) {
  const cancelExpense = useCancelExpense();
  const refreshExpenseEffects = useRefreshExpenseEffects();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && cancelExpense.isPending) {
      return;
    }

    if (!nextOpen) {
      cancelExpense.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleCancel() {
    if (
      !transaction ||
      !businessPublicId ||
      cancelExpense.isPending
    ) {
      return;
    }

    try {
      await cancelExpense.mutateAsync({
        publicId: transaction.public_id,
        businessPublicId,
      });
      onOpenChange(false);
      cancelExpense.reset();
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        await refreshExpenseEffects(businessPublicId);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>¿Anular este gasto?</DialogTitle>
          <DialogDescription className="text-zinc-500">
            El gasto será anulado. No se eliminará físicamente.
          </DialogDescription>
        </DialogHeader>

        {cancelExpense.error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {getExpenseErrorMessage(
              cancelExpense.error,
              "No fue posible anular el gasto."
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={cancelExpense.isPending}
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={
              !transaction ||
              !businessPublicId ||
              cancelExpense.isPending
            }
          >
            {cancelExpense.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Anulando...
              </>
            ) : (
              "Anular gasto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
