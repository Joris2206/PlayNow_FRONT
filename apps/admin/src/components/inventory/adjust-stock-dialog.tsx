"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

import { useAdjustProductStock } from "@/hooks/use-products";
import {
  extractDrfErrorMessage,
  extractDrfFieldError,
  getApiErrorMessage,
} from "@/lib/api-error";
import { HttpError } from "@/lib/http";

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
  AdjustProductStockResponse,
  Product,
} from "@/types/product";

type StockOperation = "increase" | "decrease";

type AdjustmentSelection = {
  product: Product;
  originBusinessPublicId: string;
};

type AdjustStockDialogProps = {
  selection: AdjustmentSelection | null;
  currentBusinessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjusted: (
    response: AdjustProductStockResponse
  ) => void;
};

function getRequestError(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 403) {
      return "No tienes permiso para ajustar el stock de este producto.";
    }

    if (error.status === 404) {
      return "El producto ya no está disponible.";
    }

    if (error.status === 0) {
      return "No se pudo confirmar el ajuste. Revisa el inventario antes de intentarlo nuevamente.";
    }

    const nonFieldError = extractDrfFieldError(
      error.data,
      "non_field_errors"
    );

    if (nonFieldError) return nonFieldError;

    const message = extractDrfErrorMessage(error.data);
    if (message) return message;
  }

  if (error instanceof TypeError) {
    return "No se pudo confirmar el ajuste. Revisa el inventario antes de intentarlo nuevamente.";
  }

  return getApiErrorMessage(
    error,
    "No fue posible ajustar el stock. Revisa el inventario antes de intentarlo nuevamente."
  );
}

export default function AdjustStockDialog({
  selection,
  currentBusinessPublicId,
  open,
  onOpenChange,
  onAdjusted,
}: AdjustStockDialogProps) {
  const [operation, setOperation] =
    useState<StockOperation>("increase");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] =
    useState(false);
  const [contextError, setContextError] =
    useState<string | null>(null);
  const currentBusinessRef = useRef(
    currentBusinessPublicId
  );
  const adjustStock = useAdjustProductStock();
  const resetAdjustStock = adjustStock.reset;

  currentBusinessRef.current = currentBusinessPublicId;

  useEffect(() => {
    if (!open) return;

    setOperation("increase");
    setQuantity("");
    setNote("");
    setAttemptedSubmit(false);
    setContextError(null);
    resetAdjustStock();
  }, [
    open,
    resetAdjustStock,
    selection?.product.public_id,
    selection?.originBusinessPublicId,
  ]);

  const quantityNumber = useMemo(() => {
    if (!/^\d+$/.test(quantity)) return null;

    const parsed = Number(quantity);
    return Number.isSafeInteger(parsed) && parsed > 0
      ? parsed
      : null;
  }, [quantity]);

  const signedDelta =
    quantityNumber === null
      ? null
      : operation === "increase"
        ? quantityNumber
        : -quantityNumber;
  const trimmedNote = note.trim();
  const noteValid =
    trimmedNote.length > 0 &&
    trimmedNote.length <= 255;
  const businessContextValid = Boolean(
    selection &&
      currentBusinessPublicId &&
      selection.originBusinessPublicId ===
        currentBusinessPublicId
  );
  const canSubmit = Boolean(
    selection &&
      signedDelta !== null &&
      noteValid &&
      businessContextValid
  );
  const estimatedStock =
    selection && signedDelta !== null
      ? selection.product.stock + signedDelta
      : null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && adjustStock.isPending) return;

    if (!nextOpen) {
      resetAdjustStock();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setAttemptedSubmit(true);
    setContextError(null);

    if (
      !selection ||
      signedDelta === null ||
      !noteValid ||
      adjustStock.isPending
    ) {
      return;
    }

    if (
      currentBusinessRef.current !==
      selection.originBusinessPublicId
    ) {
      setContextError(
        "El negocio activo cambió. Vuelve a seleccionar el producto antes de ajustar su stock."
      );
      onOpenChange(false);
      return;
    }

    const originBusinessPublicId =
      selection.originBusinessPublicId;

    try {
      const response = await adjustStock.mutateAsync({
        productPublicId: selection.product.public_id,
        businessPublicId: originBusinessPublicId,
        input: {
          quantity: signedDelta,
          note: trimmedNote,
        },
      });

      if (
        currentBusinessRef.current ===
        originBusinessPublicId
      ) {
        onAdjusted(response);
        onOpenChange(false);
      }
    } catch {
      // The mutation exposes the backend error while the dialog stays open.
    }
  }

  const quantityError =
    adjustStock.error instanceof HttpError
      ? extractDrfFieldError(
          adjustStock.error.data,
          "quantity"
        )
      : null;
  const noteError =
    adjustStock.error instanceof HttpError
      ? extractDrfFieldError(
          adjustStock.error.data,
          "note"
        )
      : null;
  const requestError =
    adjustStock.error &&
    !quantityError &&
    !noteError
    ? getRequestError(adjustStock.error)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!adjustStock.isPending}
        className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>
            Ajustar stock de {selection?.product.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Registra un ajuste manual. El stock definitivo será el confirmado por el servidor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
            <span className="text-zinc-500">
              Stock actual mostrado
            </span>
            <span className="text-right font-semibold tabular-nums text-white">
              {selection?.product.stock ?? "—"}
            </span>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-zinc-300">
              Operación
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["increase", "Aumentar"],
                ["decrease", "Disminuir"],
              ] as const).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    operation === value
                      ? "border-red-500 bg-red-500/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="stock-operation"
                    value={value}
                    checked={operation === value}
                    onChange={() => {
                      setOperation(value);
                      adjustStock.reset();
                    }}
                    disabled={adjustStock.isPending}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label
              htmlFor="adjust-stock-quantity"
              className="text-sm font-medium text-zinc-300"
            >
              Cantidad
            </label>
            <Input
              id="adjust-stock-quantity"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(event) => {
                const value = event.target.value;

                if (/^\d*$/.test(value)) {
                  setQuantity(
                    value.replace(/^0+(?=\d)/, "")
                  );
                  adjustStock.reset();
                }
              }}
              disabled={adjustStock.isPending}
              aria-invalid={Boolean(
                quantityError ||
                  (attemptedSubmit &&
                    quantityNumber === null)
              )}
              aria-describedby="adjust-stock-quantity-help"
              className="h-11 border-white/10 bg-black/30 text-white"
            />
            <p
              id="adjust-stock-quantity-help"
              className={
                quantityError ||
                (attemptedSubmit &&
                  quantityNumber === null)
                  ? "text-xs text-red-400"
                  : "text-xs text-zinc-600"
              }
            >
              {quantityError ??
                (attemptedSubmit &&
                quantityNumber === null
                  ? "Ingresa un número entero positivo y seguro."
                  : "Ingresa la cantidad sin signo.")}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adjust-stock-note"
              className="text-sm font-medium text-zinc-300"
            >
              Motivo
            </label>
            <textarea
              id="adjust-stock-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                adjustStock.reset();
              }}
              maxLength={255}
              rows={4}
              required
              disabled={adjustStock.isPending}
              aria-invalid={Boolean(
                noteError ||
                  (attemptedSubmit && !noteValid)
              )}
              aria-describedby="adjust-stock-note-help"
              className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex justify-between gap-3 text-xs">
              <p
                id="adjust-stock-note-help"
                className={
                  noteError ||
                  (attemptedSubmit && !noteValid)
                    ? "text-red-400"
                    : "text-zinc-600"
                }
              >
                {noteError ??
                  (attemptedSubmit && !noteValid
                    ? "Escribe un motivo de hasta 255 caracteres."
                    : "Obligatorio; se guardará sin espacios externos.")}
              </p>
              <span className="shrink-0 tabular-nums text-zinc-600">
                {note.length}/255
              </span>
            </div>
          </div>

          {estimatedStock !== null && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                estimatedStock < 0
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
                  : "border-white/10 bg-white/[0.02] text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span>Stock estimado</span>
                <span className="font-semibold tabular-nums">
                  {estimatedStock}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-75">
                Es una estimación; el servidor confirmará el stock definitivo.
              </p>
              {estimatedStock < 0 && (
                <p className="mt-2 flex items-start gap-2 text-xs font-medium">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  El stock mostrado no alcanza, pero puede estar desactualizado. El servidor validará el ajuste.
                </p>
              )}
            </div>
          )}

          {(contextError || requestError) && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {contextError ?? requestError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={adjustStock.isPending}
              className="border-white/10 bg-transparent text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || adjustStock.isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {adjustStock.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Ajustando...
                </>
              ) : (
                "Confirmar ajuste"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
