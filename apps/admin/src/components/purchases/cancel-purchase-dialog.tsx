"use client";

import { LoaderCircle } from "lucide-react";
import { useCancelPurchase, useRefreshPurchaseEffects } from "@/hooks/use-transactions";
import { HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Transaction } from "@/types/transaction";

type Props = { transaction: Transaction | null; businessPublicId?: string; open: boolean; onOpenChange: (open: boolean) => void };

function firstApiMessage(error: unknown) {
  if (!(error instanceof HttpError) || typeof error.data !== "object" || error.data === null) return error instanceof Error ? error.message : "No fue posible anular la compra.";
  const data = error.data as Record<string, unknown>;
  for (const value of [data.details, data.detail, ...Object.values(data)]) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return error.message;
}

export default function CancelPurchaseDialog({ transaction, businessPublicId, open, onOpenChange }: Props) {
  const cancelPurchase = useCancelPurchase();
  const refreshPurchaseEffects = useRefreshPurchaseEffects();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && cancelPurchase.isPending) return;
    if (!nextOpen) cancelPurchase.reset();
    onOpenChange(nextOpen);
  }

  async function handleCancel() {
    if (!transaction || !businessPublicId || cancelPurchase.isPending) return;
    try {
      await cancelPurchase.mutateAsync({ publicId: transaction.public_id, businessPublicId });
      onOpenChange(false);
      cancelPurchase.reset();
    } catch (error) {
      if (error instanceof HttpError && (error.status === 400 || error.status === 409)) {
        await refreshPurchaseEffects(businessPublicId);
      }
    }
  }

  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent className="border-white/10 bg-zinc-950 text-white">
    <DialogHeader><DialogTitle>¿Anular esta compra?</DialogTitle><DialogDescription className="text-zinc-500">La compra no se eliminará físicamente: pasará a Anulado y PlayNow API revertirá el inventario generado por ella.</DialogDescription></DialogHeader>
    {cancelPurchase.error && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{firstApiMessage(cancelPurchase.error)}</div>}
    <DialogFooter><Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={cancelPurchase.isPending} className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancelar</Button><Button type="button" variant="destructive" onClick={handleCancel} disabled={!transaction || !businessPublicId || cancelPurchase.isPending}>{cancelPurchase.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Anulando...</> : "Anular compra"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
