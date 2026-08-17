"use client";

import { LoaderCircle } from "lucide-react";
import { useCancelSale, useRefreshSaleEffects } from "@/hooks/use-transactions";
import { HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Transaction } from "@/types/transaction";

type Props = { transaction: Transaction | null; businessPublicId?: string; open: boolean; onOpenChange: (open: boolean) => void };

export default function CancelSaleDialog({ transaction, businessPublicId, open, onOpenChange }: Props) {
  const cancelSale = useCancelSale();
  const refreshSaleEffects = useRefreshSaleEffects();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && cancelSale.isPending) return;
    if (!nextOpen) cancelSale.reset();
    onOpenChange(nextOpen);
  }

  async function handleCancel() {
    if (!transaction || !businessPublicId || cancelSale.isPending) return;
    try {
      await cancelSale.mutateAsync({ publicId: transaction.public_id, businessPublicId });
      onOpenChange(false);
      cancelSale.reset();
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        await refreshSaleEffects(businessPublicId);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950 text-white">
        <DialogHeader><DialogTitle>¿Anular esta venta?</DialogTitle><DialogDescription className="text-zinc-500">La venta no será borrada físicamente. PlayNow API la marcará como anulada y restaurará el stock correspondiente.</DialogDescription></DialogHeader>
        {cancelSale.error && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{cancelSale.error instanceof Error ? cancelSale.error.message : "No fue posible anular la venta."}</div>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={cancelSale.isPending} className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancelar</Button>
          <Button type="button" variant="destructive" onClick={handleCancel} disabled={!transaction || !businessPublicId || cancelSale.isPending}>{cancelSale.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Anulando...</> : "Anular venta"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
