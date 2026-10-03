"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useCreatePurchase, useRefreshPurchaseEffects } from "@/hooks/use-transactions";
import { findStatusByName } from "@/lib/catalog-status";
import { extractDrfErrorMessage, getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";
import PurchaseProductSelectorDialog from "@/components/purchases/purchase-product-selector-dialog";
import PurchaseSupplierSelectorDialog from "@/components/purchases/purchase-supplier-selector-dialog";
import CreateSupplierDialog from "@/components/suppliers/create-supplier-dialog";
import { calculateEstimatedTotal, formatSaleMoney, subtractMoney, toMoneyMinorUnits } from "@/components/sales/sales-format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";
import type { PaymentStatus } from "@/types/transaction";

const PAYMENT_METHOD_PAGE_SIZE = 100;
const PAYMENT_METHOD_TYPE_LABELS = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", other: "Otro" } as const;
const API_FIELD_LABELS: Record<string, string> = { supplier_public_id: "Proveedor", payment_method_public_id: "Método de pago", payment_status: "Estado de pago", initial_paid_amount: "Pago inicial", details: "Detalle" };
type PurchaseLine = { product: Product; quantity: string; unitPrice: string };
type Props = { businessPublicId?: string; canCreateSupplier: boolean; open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void };

function firstApiMessage(error: unknown) {
  if (!(error instanceof HttpError) || typeof error.data !== "object" || error.data === null) return getApiErrorMessage(error, "No fue posible registrar la compra.");
  const data = error.data as Record<string, unknown>;
  for (const field of ["details", "detail"]) {
    const value = data[field];
    const message = extractDrfErrorMessage(value);
    if (message) return message;
  }
  for (const [field, value] of Object.entries(data)) {
    const message = extractDrfErrorMessage(value);
    if (message) return `${API_FIELD_LABELS[field] ?? field}: ${message}`;
  }
  if (error.status === 403) return "No tienes permisos para registrar esta compra.";
  if (error.status === 404) return "Uno de los recursos seleccionados ya no está disponible para este negocio.";
  return error.status === 409 ? "La operación cambió mientras registrabas la compra. Revisa los datos e inténtalo nuevamente." : getApiErrorMessage(error, "No fue posible registrar la compra.");
}

function isValidQuantity(value: string) {
  const quantity = Number(value);
  return Boolean(value) && Number.isInteger(quantity) && quantity >= 1 && quantity <= 100000;
}

function isValidUnitPrice(value: string) {
  return /^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) >= 0;
}

export default function CreatePurchaseDialog({ businessPublicId, canCreateSupplier, open, onOpenChange, onCreated }: Props) {
  const [supplierPublicId, setSupplierPublicId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierSelectorOpen, setSupplierSelectorOpen] = useState(false);
  const [createSupplierDialogOpen, setCreateSupplierDialogOpen] = useState(false);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [concept, setConcept] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceSeries, setInvoiceSeries] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [paymentMethodPublicId, setPaymentMethodPublicId] = useState("");
  const [initialPaidAmount, setInitialPaidAmount] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touchedQuantities, setTouchedQuantities] = useState<Record<string, boolean>>({});
  const [touchedPrices, setTouchedPrices] = useState<Record<string, boolean>>({});
  const createPurchase = useCreatePurchase();
  const refreshPurchaseEffects = useRefreshPurchaseEffects();
  const resetCreatePurchase = createPurchase.reset;
  const statusesQuery = useEntityStatuses(open);
  const activeStatus = findStatusByName(statusesQuery.data?.results ?? [], "Activo");
  const paymentMethodsQuery = usePaymentMethods({ businessPublicId: open ? businessPublicId : undefined, page: 1, pageSize: PAYMENT_METHOD_PAGE_SIZE, ordering: "name" });

  useEffect(() => {
    if (!open) return;
    setSupplierPublicId(""); setSelectedSupplier(null); setSupplierSelectorOpen(false); setCreateSupplierDialogOpen(false);
    setProductSelectorOpen(false); setLines([]);
    setConcept(""); setInvoiceNumber(""); setInvoiceSeries(""); setPaymentStatus("paid"); setPaymentMethodPublicId(""); setInitialPaidAmount(""); setAttemptedSubmit(false); setTouchedQuantities({}); setTouchedPrices({}); resetCreatePurchase();
  }, [open, businessPublicId, resetCreatePurchase]);

  const selectedProductIds = useMemo(
    () => new Set(lines.map((line) => line.product.public_id)),
    [lines]
  );
  const invalidLines = lines.filter((line) => !isValidQuantity(line.quantity) || !isValidUnitPrice(line.unitPrice));
  const estimatedTotal = calculateEstimatedTotal(lines.map((line) => ({ unitPrice: line.unitPrice, quantity: isValidQuantity(line.quantity) ? Number(line.quantity) : 0 })));
  const estimatedTotalMinor = toMoneyMinorUnits(estimatedTotal) ?? 0n;
  const hasPositiveTotal = estimatedTotalMinor > 0n;
  const requiresSupplier = hasPositiveTotal && (paymentStatus === "pending" || paymentStatus === "partial");
  const requiresPaymentMethod = hasPositiveTotal && (paymentStatus === "paid" || paymentStatus === "partial");
  const initialPaidMinor = toMoneyMinorUnits(initialPaidAmount);
  const validInitialPaidAmount = paymentStatus !== "partial" || (initialPaidMinor !== null && initialPaidMinor > 0n && initialPaidMinor < estimatedTotalMinor);
  const estimatedBalance = subtractMoney(estimatedTotal, initialPaidAmount);
  const canSubmit = Boolean(businessPublicId && lines.length > 0 && invalidLines.length === 0 && (!requiresSupplier || supplierPublicId) && (!requiresPaymentMethod || paymentMethodPublicId) && validInitialPaidAmount);
  const guidance = !businessPublicId ? "No hay un negocio activo para registrar la compra." : lines.length === 0 ? "Agrega al menos un producto." : invalidLines.length > 0 ? "Corrige las cantidades y costos antes de registrar la compra." : requiresSupplier && !supplierPublicId ? "La compra pendiente o parcial necesita un proveedor." : requiresPaymentMethod && !paymentMethodPublicId ? "Selecciona el método de pago." : !validInitialPaidAmount ? "El pago inicial debe ser mayor que cero y menor que el total estimado." : null;

  useEffect(() => {
    if (hasPositiveTotal) return;
    setPaymentStatus("paid");
    setPaymentMethodPublicId("");
    setInitialPaidAmount("");
  }, [hasPositiveTotal]);

  useEffect(() => {
    if (!paymentMethodPublicId || !paymentMethodsQuery.isSuccess) return;
    if (!paymentMethodsQuery.data.results.some((method) => method.public_id === paymentMethodPublicId)) {
      setPaymentMethodPublicId("");
    }
  }, [paymentMethodPublicId, paymentMethodsQuery.data, paymentMethodsQuery.isSuccess]);

  function changePaymentStatus(status: PaymentStatus) {
    setPaymentStatus(status);
    if (status === "pending") setPaymentMethodPublicId("");
    if (status !== "partial") setInitialPaidAmount("");
  }

  function addProduct(product: Product) {
    setLines((current) => {
      if (current.some((line) => line.product.public_id === product.public_id)) {
        return current;
      }

      return [...current, { product, quantity: "1", unitPrice: product.base_cost }];
    });
  }

  function updateLine(publicId: string, patch: Partial<Pick<PurchaseLine, "quantity" | "unitPrice">>) {
    setLines((current) => current.map((line) => line.product.public_id === publicId ? { ...line, ...patch } : line));
  }

  function resetAndClose() {
    if (createPurchase.isPending) return;
    resetCreatePurchase();
    onOpenChange(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId || createPurchase.isPending) return;
    const normalizedConcept = concept.trim();
    const normalizedInvoiceNumber = invoiceNumber.trim();
    const normalizedInvoiceSeries = invoiceSeries.trim();
    try {
      await createPurchase.mutateAsync({
        business_public_id: businessPublicId,
        ...(supplierPublicId ? { supplier_public_id: supplierPublicId } : {}),
        type: "purchase",
        payment_status: paymentStatus,
        ...(requiresPaymentMethod ? { payment_method_public_id: paymentMethodPublicId } : {}),
        ...(paymentStatus === "partial" ? { initial_paid_amount: initialPaidAmount } : {}),
        ...(normalizedConcept ? { concept: normalizedConcept } : {}),
        ...(normalizedInvoiceNumber ? { invoice_number: normalizedInvoiceNumber } : {}),
        ...(normalizedInvoiceSeries ? { invoice_series: normalizedInvoiceSeries } : {}),
        details: lines.map((line) => ({ product_public_id: line.product.public_id, quantity: Number(line.quantity), unit_price: line.unitPrice })),
      });
      onCreated();
      onOpenChange(false);
    } catch (error) {
      // React Query exposes the request error below.
      if (error instanceof HttpError && error.status === 409) await refreshPurchaseEffects(businessPublicId);
    }
  }

  const errorMessage = createPurchase.error ? firstApiMessage(createPurchase.error) : null;
  return <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
    <DialogHeader><DialogTitle>Nueva compra</DialogTitle><DialogDescription className="text-zinc-500">Registra una compra pagada, pendiente o parcial.</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-6">
      <section
        className="space-y-3"
        aria-labelledby="purchase-supplier-label"
        aria-describedby={
          attemptedSubmit && requiresSupplier && !supplierPublicId
            ? "purchase-supplier-description purchase-supplier-error"
            : "purchase-supplier-description"
        }
      >
        <div>
          <h3 id="purchase-supplier-label" className="text-sm font-medium text-zinc-300">
            Proveedor {requiresSupplier ? "(obligatorio)" : "(opcional)"}
          </h3>
          <p id="purchase-supplier-description" className="mt-1 text-xs text-zinc-500">
            {requiresSupplier
              ? "Las compras pendientes o parciales requieren proveedor."
              : "Puedes registrar la compra pagada sin proveedor."}
          </p>
        </div>

        {selectedSupplier ? (
          <div
            className={`flex flex-col gap-4 rounded-xl border bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between ${
              attemptedSubmit && requiresSupplier && !supplierPublicId
                ? "border-red-500/50"
                : "border-white/10"
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Proveedor seleccionado
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {selectedSupplier.name}
              </p>
              {selectedSupplier.phone && (
                <p className="mt-1 text-xs text-zinc-400">
                  {selectedSupplier.phone}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="inverseOutline"
                size="sm"
                onClick={() => setSupplierSelectorOpen(true)}
                disabled={!businessPublicId || createPurchase.isPending}
              >
                Cambiar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSupplierPublicId("");
                  setSelectedSupplier(null);
                }}
                disabled={createPurchase.isPending}
                aria-label={`Quitar a ${selectedSupplier.name} de la compra`}
                className="text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Quitar
              </Button>
              {canCreateSupplier && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateSupplierDialogOpen(true)}
                  disabled={!businessPublicId || createPurchase.isPending}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo proveedor
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between ${
              attemptedSubmit && requiresSupplier
                ? "border-red-500/50 bg-red-500/5"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <p className="text-sm text-zinc-500">Sin proveedor seleccionado.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="inverseOutline"
                onClick={() => setSupplierSelectorOpen(true)}
                disabled={!businessPublicId || createPurchase.isPending}
                aria-invalid={attemptedSubmit && requiresSupplier}
              >
                Seleccionar proveedor
              </Button>
              {canCreateSupplier && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateSupplierDialogOpen(true)}
                  disabled={!businessPublicId || createPurchase.isPending}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo proveedor
                </Button>
              )}
            </div>
          </div>
        )}

        {attemptedSubmit && requiresSupplier && !supplierPublicId && (
          <p id="purchase-supplier-error" className="text-xs text-red-400">
            Selecciona un proveedor para la compra pendiente o parcial.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><label htmlFor="purchase-invoice-series" className="text-sm font-medium text-zinc-300">Serie (opcional)</label><Input id="purchase-invoice-series" value={invoiceSeries} onChange={(event) => setInvoiceSeries(event.target.value)} disabled={createPurchase.isPending} className="border-white/10 bg-black/30 text-white" /></div><div className="space-y-2"><label htmlFor="purchase-invoice-number" className="text-sm font-medium text-zinc-300">Factura (opcional)</label><Input id="purchase-invoice-number" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} disabled={createPurchase.isPending} className="border-white/10 bg-black/30 text-white" /></div><div className="space-y-2"><label htmlFor="purchase-concept" className="text-sm font-medium text-zinc-300">Concepto (opcional)</label><Input id="purchase-concept" value={concept} onChange={(event) => setConcept(event.target.value)} disabled={createPurchase.isPending} className="border-white/10 bg-black/30 text-white" /></div></section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium text-white">Detalle</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {lines.length} {lines.length === 1 ? "producto agregado" : "productos agregados"}
            </p>
          </div>
          <Button
            type="button"
            variant="inverseOutline"
            onClick={() => setProductSelectorOpen(true)}
            disabled={!businessPublicId || !activeStatus || createPurchase.isPending}
          >
            Agregar productos
          </Button>
        </div>
        {statusesQuery.isError && <p role="alert" className="text-sm text-red-300">No fue posible encontrar el estado Activo de los productos.</p>}
        {statusesQuery.isSuccess && !activeStatus && <p role="alert" className="text-sm text-amber-300">No existe el estado Activo necesario para consultar productos.</p>}
        {lines.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-zinc-500">Todavía no agregaste productos.</div> : <div className="space-y-2">{lines.map((line) => { const invalidQuantity = !isValidQuantity(line.quantity); const invalidPrice = !isValidUnitPrice(line.unitPrice); const showQuantityError = invalidQuantity && (attemptedSubmit || touchedQuantities[line.product.public_id]); const showPriceError = invalidPrice && (attemptedSubmit || touchedPrices[line.product.public_id]); const lineTotal = calculateEstimatedTotal([{ unitPrice: line.unitPrice, quantity: isValidQuantity(line.quantity) ? Number(line.quantity) : 0 }]); return <div key={line.product.public_id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-[minmax(0,1fr)_120px_140px_130px_44px] sm:items-start"><div className="min-w-0 pt-2"><p className="truncate text-sm font-medium text-white">{line.product.title}</p><p className="text-xs text-zinc-500">Stock actual: {line.product.stock}</p></div><div><label htmlFor={`purchase-quantity-${line.product.public_id}`} className="text-xs text-zinc-500">Cantidad</label><Input id={`purchase-quantity-${line.product.public_id}`} type="text" inputMode="numeric" pattern="[0-9]*" value={line.quantity} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ""); updateLine(line.product.public_id, { quantity: digits.replace(/^0+(?=\d)/, "") }); }} onBlur={() => setTouchedQuantities((current) => ({ ...current, [line.product.public_id]: true }))} disabled={createPurchase.isPending} aria-invalid={showQuantityError} aria-describedby={showQuantityError ? `purchase-quantity-${line.product.public_id}-error` : undefined} className="mt-1 border-white/10 bg-black/30 text-white" />{showQuantityError && <p id={`purchase-quantity-${line.product.public_id}-error`} className="mt-1 text-xs text-red-400">Entero entre 1 y 100000.</p>}</div><div><label htmlFor={`purchase-price-${line.product.public_id}`} className="text-xs text-zinc-500">Costo unitario</label><Input id={`purchase-price-${line.product.public_id}`} type="text" inputMode="decimal" value={line.unitPrice} onChange={(event) => { const value = event.target.value; if (/^\d*(?:\.\d{0,2})?$/.test(value)) updateLine(line.product.public_id, { unitPrice: value }); }} onBlur={() => setTouchedPrices((current) => ({ ...current, [line.product.public_id]: true }))} disabled={createPurchase.isPending} aria-invalid={showPriceError} aria-describedby={showPriceError ? `purchase-price-${line.product.public_id}-error` : undefined} className="mt-1 border-white/10 bg-black/30 text-white" />{showPriceError && <p id={`purchase-price-${line.product.public_id}-error`} className="mt-1 text-xs text-red-400">Decimal mayor o igual a 0, máximo 2 decimales.</p>}</div><p className="pt-7 text-right text-sm font-medium text-white">{formatSaleMoney(lineTotal)}</p><Button type="button" variant="ghost" size="icon" onClick={() => setLines((current) => current.filter((item) => item.product.public_id !== line.product.public_id))} disabled={createPurchase.isPending} aria-label={`Retirar ${line.product.title}`} className="mt-5 text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></div>; })}</div>}
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Total estimado</span><strong className="text-xl text-white">{formatSaleMoney(estimatedTotal)}</strong></div>
        <div className="space-y-2"><label htmlFor="purchase-payment-status" className="text-sm font-medium text-zinc-300">Estado de pago</label><select id="purchase-payment-status" value={paymentStatus} onChange={(event) => changePaymentStatus(event.target.value as PaymentStatus)} disabled={!hasPositiveTotal || createPurchase.isPending} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"><option value="paid">Pagado</option><option value="pending">Pendiente</option><option value="partial">Parcial</option></select>{!hasPositiveTotal && <p className="text-xs text-zinc-500">Con total estimado cero, la operación solo puede registrarse como pagada y sin método de pago.</p>}</div>
        {requiresPaymentMethod && <div className="space-y-2"><label htmlFor="purchase-payment-method" className="text-sm font-medium text-zinc-300">Método de pago</label><select id="purchase-payment-method" value={paymentMethodPublicId} onChange={(event) => setPaymentMethodPublicId(event.target.value)} disabled={paymentMethodsQuery.isLoading || createPurchase.isPending} aria-invalid={attemptedSubmit && !paymentMethodPublicId} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"><option value="">{paymentMethodsQuery.isLoading ? "Cargando métodos..." : "Selecciona un método"}</option>{paymentMethodsQuery.data?.results.map((method) => <option key={method.public_id} value={method.public_id}>{method.name} · {PAYMENT_METHOD_TYPE_LABELS[method.method_type]}</option>)}</select>{attemptedSubmit && !paymentMethodPublicId && <p className="text-xs text-red-400">Selecciona un método de pago.</p>}{paymentMethodsQuery.isError && <div className="flex items-center justify-between gap-3 text-sm text-red-300"><span>No fue posible cargar los métodos de pago.</span><Button type="button" variant="ghost" size="sm" onClick={() => paymentMethodsQuery.refetch()}>Reintentar</Button></div>}</div>}
        {paymentStatus === "partial" && hasPositiveTotal && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="purchase-initial-paid-amount" className="text-sm font-medium text-zinc-300">Importe pagado inicialmente</label><Input id="purchase-initial-paid-amount" type="text" inputMode="decimal" value={initialPaidAmount} onChange={(event) => { const value = event.target.value; if (/^\d*(?:\.\d{0,2})?$/.test(value)) setInitialPaidAmount(value); }} disabled={createPurchase.isPending} aria-invalid={attemptedSubmit && !validInitialPaidAmount} className="border-white/10 bg-black/30 text-white" />{attemptedSubmit && !validInitialPaidAmount && <p className="text-xs text-red-400">Debe ser mayor que cero y menor que el total estimado.</p>}</div><div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4"><span className="text-sm text-zinc-400">Saldo estimado</span><strong className="text-white">{formatSaleMoney(estimatedBalance)}</strong></div></div>}
      </section>
      {errorMessage && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}
      {!createPurchase.isPending && guidance && <p className="text-sm text-zinc-400" aria-live="polite">{guidance}</p>}
      <DialogFooter><Button type="button" variant="outline" onClick={resetAndClose} disabled={createPurchase.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="submit" disabled={!canSubmit || createPurchase.isPending} className="bg-red-500 text-white hover:bg-red-600">{createPurchase.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Registrando...</> : "Registrar compra"}</Button></DialogFooter>
    </form>
    {canCreateSupplier && (
      <CreateSupplierDialog
        businessPublicId={businessPublicId}
        open={createSupplierDialogOpen}
        onOpenChange={setCreateSupplierDialogOpen}
        onCreated={(supplier) => {
          setSelectedSupplier(supplier);
          setSupplierPublicId(supplier.public_id);
        }}
      />
    )}
    <PurchaseSupplierSelectorDialog
      businessPublicId={businessPublicId}
      selectedSupplier={selectedSupplier}
      open={supplierSelectorOpen}
      disabled={createPurchase.isPending}
      onOpenChange={setSupplierSelectorOpen}
      onSelect={(supplier) => {
        setSelectedSupplier(supplier);
        setSupplierPublicId(supplier.public_id);
      }}
    />
    <PurchaseProductSelectorDialog
      businessPublicId={businessPublicId}
      activeStatusPublicId={activeStatus?.public_id}
      selectedProductIds={selectedProductIds}
      open={productSelectorOpen}
      disabled={createPurchase.isPending}
      onOpenChange={setProductSelectorOpen}
      onAdd={addProduct}
    />
  </DialogContent></Dialog>;
}
