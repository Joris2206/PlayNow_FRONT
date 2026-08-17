"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { useProducts } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCreatePurchase } from "@/hooks/use-transactions";
import { findStatusByName } from "@/lib/catalog-status";
import { HttpError } from "@/lib/http";
import CreateSupplierDialog from "@/components/suppliers/create-supplier-dialog";
import { calculateEstimatedTotal, formatSaleMoney } from "@/components/sales/sales-format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

const PRODUCT_PAGE_SIZE = 10;
const SUPPLIER_PAGE_SIZE = 10;
type PurchaseLine = { product: Product; quantity: string; unitPrice: string };
type Props = { businessPublicId?: string; open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void };

function firstApiMessage(error: unknown) {
  if (!(error instanceof HttpError) || typeof error.data !== "object" || error.data === null) return error instanceof Error ? error.message : "No fue posible registrar la compra.";
  const data = error.data as Record<string, unknown>;
  for (const value of [data.details, data.detail, ...Object.values(data)]) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return error.message;
}

function isValidQuantity(value: string) {
  const quantity = Number(value);
  return Boolean(value) && Number.isInteger(quantity) && quantity >= 1 && quantity <= 100000;
}

function isValidUnitPrice(value: string) {
  return /^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) >= 0;
}

export default function CreatePurchaseDialog({ businessPublicId, open, onOpenChange, onCreated }: Props) {
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierSearchInput, setSupplierSearchInput] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierPublicId, setSupplierPublicId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [concept, setConcept] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceSeries, setInvoiceSeries] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touchedQuantities, setTouchedQuantities] = useState<Record<string, boolean>>({});
  const [touchedPrices, setTouchedPrices] = useState<Record<string, boolean>>({});
  const createPurchase = useCreatePurchase();
  const resetCreatePurchase = createPurchase.reset;
  const statusesQuery = useEntityStatuses(open);
  const activeStatus = findStatusByName(statusesQuery.data?.results ?? [], "Activo");
  const suppliersQuery = useSuppliers({ businessPublicId: open ? businessPublicId : undefined, page: supplierPage, pageSize: SUPPLIER_PAGE_SIZE, search: supplierSearch, ordering: "name" });
  const productsQuery = useProducts({ businessPublicId: open && activeStatus ? businessPublicId : undefined, page: productPage, pageSize: PRODUCT_PAGE_SIZE, search: productSearch, ordering: "title", statusPublicId: activeStatus?.public_id });

  useEffect(() => { const timeout = setTimeout(() => { setSupplierSearch(supplierSearchInput.trim()); setSupplierPage(1); }, 400); return () => clearTimeout(timeout); }, [supplierSearchInput]);
  useEffect(() => { const timeout = setTimeout(() => { setProductSearch(productSearchInput.trim()); setProductPage(1); }, 400); return () => clearTimeout(timeout); }, [productSearchInput]);
  useEffect(() => {
    if (!open) return;
    setSupplierPage(1); setSupplierSearchInput(""); setSupplierSearch(""); setSupplierPublicId(""); setSelectedSupplier(null); setSupplierDialogOpen(false);
    setProductPage(1); setProductSearchInput(""); setProductSearch(""); setLines([]);
    setConcept(""); setInvoiceNumber(""); setInvoiceSeries(""); setAttemptedSubmit(false); setTouchedQuantities({}); setTouchedPrices({}); resetCreatePurchase();
  }, [open, businessPublicId, resetCreatePurchase]);

  const suppliers = useMemo(() => {
    const listed = suppliersQuery.data?.results ?? [];
    return selectedSupplier && !listed.some((supplier) => supplier.public_id === selectedSupplier.public_id) ? [selectedSupplier, ...listed] : listed;
  }, [selectedSupplier, suppliersQuery.data]);
  const invalidLines = lines.filter((line) => !isValidQuantity(line.quantity) || !isValidUnitPrice(line.unitPrice));
  const estimatedTotal = calculateEstimatedTotal(lines.map((line) => ({ unitPrice: line.unitPrice, quantity: isValidQuantity(line.quantity) ? Number(line.quantity) : 0 })));
  const canSubmit = Boolean(businessPublicId && lines.length > 0 && invalidLines.length === 0);
  const guidance = !businessPublicId ? "No hay un negocio activo para registrar la compra." : lines.length === 0 ? "Agrega al menos un producto." : invalidLines.length > 0 ? "Corrige las cantidades y costos antes de registrar la compra." : null;

  function addProduct(product: Product) {
    if (lines.some((line) => line.product.public_id === product.public_id)) return;
    setLines((current) => [...current, { product, quantity: "1", unitPrice: product.base_cost }]);
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
        payment_status: "paid",
        ...(normalizedConcept ? { concept: normalizedConcept } : {}),
        ...(normalizedInvoiceNumber ? { invoice_number: normalizedInvoiceNumber } : {}),
        ...(normalizedInvoiceSeries ? { invoice_series: normalizedInvoiceSeries } : {}),
        details: lines.map((line) => ({ product_public_id: line.product.public_id, quantity: Number(line.quantity), unit_price: line.unitPrice })),
      });
      onCreated();
      onOpenChange(false);
    } catch {
      // React Query exposes the request error below.
    }
  }

  const errorMessage = createPurchase.error ? firstApiMessage(createPurchase.error) : null;
  return <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()}><DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
    <DialogHeader><DialogTitle>Nueva compra</DialogTitle><DialogDescription className="text-zinc-500">Registra una compra pagada. PlayNow API actualizará el inventario y calculará el total definitivo.</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3"><div><label htmlFor="purchase-supplier" className="text-sm font-medium text-zinc-300">Proveedor (opcional)</label><p className="mt-1 text-xs text-zinc-500">Puedes registrar la compra sin proveedor.</p></div><Button type="button" variant="ghost" size="sm" onClick={() => setSupplierDialogOpen(true)} disabled={!businessPublicId || createPurchase.isPending} className="text-red-400 hover:bg-red-500/10 hover:text-red-300"><Plus className="h-4 w-4" />Nuevo proveedor</Button></div>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input type="search" value={supplierSearchInput} onChange={(event) => setSupplierSearchInput(event.target.value)} placeholder="Buscar proveedor..." aria-label="Buscar proveedor para la compra" disabled={createPurchase.isPending} className="h-11 border-white/10 bg-black/30 pl-10 text-white" /></div>
        <select id="purchase-supplier" value={supplierPublicId} onChange={(event) => { const publicId = event.target.value; setSupplierPublicId(publicId); setSelectedSupplier(suppliers.find((supplier) => supplier.public_id === publicId) ?? null); }} disabled={suppliersQuery.isLoading || createPurchase.isPending} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"><option value="">Sin proveedor</option>{suppliers.map((supplier) => <option key={supplier.public_id} value={supplier.public_id}>{supplier.name} · {supplier.phone}</option>)}</select>
        {suppliersQuery.isError && <div className="flex items-center justify-between gap-3 text-sm text-red-300"><span>No fue posible cargar los proveedores.</span><Button type="button" variant="ghost" size="sm" onClick={() => suppliersQuery.refetch()}>Reintentar</Button></div>}
        {suppliersQuery.data && suppliersQuery.data.total_pages > 1 && <div className="flex items-center justify-end gap-2"><Button type="button" variant="outline" size="sm" disabled={!suppliersQuery.data.previous || createPurchase.isPending} onClick={() => setSupplierPage((page) => Math.max(1, page - 1))} className="border-white/10 bg-transparent text-zinc-300">Anterior</Button><span className="text-xs text-zinc-500">Página {suppliersQuery.data.current_page} de {suppliersQuery.data.total_pages}</span><Button type="button" variant="outline" size="sm" disabled={!suppliersQuery.data.next || createPurchase.isPending} onClick={() => setSupplierPage((page) => page + 1)} className="border-white/10 bg-transparent text-zinc-300">Siguiente</Button></div>}
      </section>

      <section className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><label htmlFor="purchase-invoice-series" className="text-sm font-medium text-zinc-300">Serie (opcional)</label><Input id="purchase-invoice-series" value={invoiceSeries} onChange={(event) => setInvoiceSeries(event.target.value)} disabled={createPurchase.isPending} className="border-white/10 bg-black/30 text-white" /></div><div className="space-y-2"><label htmlFor="purchase-invoice-number" className="text-sm font-medium text-zinc-300">Factura (opcional)</label><Input id="purchase-invoice-number" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} disabled={createPurchase.isPending} className="border-white/10 bg-black/30 text-white" /></div><div className="space-y-2"><label htmlFor="purchase-concept" className="text-sm font-medium text-zinc-300">Concepto (opcional)</label><Input id="purchase-concept" value={concept} onChange={(event) => setConcept(event.target.value)} disabled={createPurchase.isPending} className="border-white/10 bg-black/30 text-white" /></div></section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div><h3 className="font-medium text-white">Agregar productos</h3><p className="mt-1 text-sm text-zinc-500">Solo se consultan productos con estado Activo. El stock actual es informativo.</p></div>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input type="search" value={productSearchInput} onChange={(event) => setProductSearchInput(event.target.value)} placeholder="Buscar productos..." aria-label="Buscar productos para la compra" disabled={createPurchase.isPending} className="h-11 border-white/10 bg-black/30 pl-10 text-white" /></div>
        {statusesQuery.isSuccess && !activeStatus && <p role="alert" className="text-sm text-amber-300">No existe el estado Activo necesario para consultar productos.</p>}
        {productsQuery.isLoading && <p className="text-sm text-zinc-500">Cargando productos...</p>}
        {productsQuery.isError && <div className="flex items-center justify-between gap-3 text-sm text-red-300"><span>No fue posible cargar los productos.</span><Button type="button" size="sm" variant="ghost" onClick={() => productsQuery.refetch()}>Reintentar</Button></div>}
        {productsQuery.data && <div className="space-y-2">{productsQuery.data.results.length === 0 ? <p className="text-sm text-zinc-500">No hay productos que coincidan con la búsqueda.</p> : productsQuery.data.results.map((product) => { const added = lines.some((line) => line.product.public_id === product.public_id); return <div key={product.public_id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{product.title}</p><p className="mt-1 text-xs text-zinc-500">Costo base: {formatSaleMoney(product.base_cost)} · Stock actual: {product.stock}</p></div><Button type="button" size="sm" variant="outline" onClick={() => addProduct(product)} disabled={added || createPurchase.isPending} className="border-white/10 bg-transparent text-zinc-300"><Plus className="h-4 w-4" />{added ? "Agregado" : "Agregar"}</Button></div>; })}</div>}
        {productsQuery.data && productsQuery.data.total_pages > 1 && <div className="flex items-center justify-end gap-2"><Button type="button" size="sm" variant="outline" disabled={!productsQuery.data.previous || createPurchase.isPending} onClick={() => setProductPage((page) => Math.max(1, page - 1))} className="border-white/10 bg-transparent text-zinc-300">Anterior</Button><span className="text-xs text-zinc-500">Página {productsQuery.data.current_page} de {productsQuery.data.total_pages}</span><Button type="button" size="sm" variant="outline" disabled={!productsQuery.data.next || createPurchase.isPending} onClick={() => setProductPage((page) => page + 1)} className="border-white/10 bg-transparent text-zinc-300">Siguiente</Button></div>}
      </section>

      <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-medium text-white">Detalle</h3><span className="text-sm text-zinc-500">{lines.length} {lines.length === 1 ? "producto" : "productos"}</span></div>
        {lines.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">Todavía no agregaste productos.</div> : <div className="space-y-2">{lines.map((line) => { const invalidQuantity = !isValidQuantity(line.quantity); const invalidPrice = !isValidUnitPrice(line.unitPrice); const showQuantityError = invalidQuantity && (attemptedSubmit || touchedQuantities[line.product.public_id]); const showPriceError = invalidPrice && (attemptedSubmit || touchedPrices[line.product.public_id]); const lineTotal = calculateEstimatedTotal([{ unitPrice: line.unitPrice, quantity: isValidQuantity(line.quantity) ? Number(line.quantity) : 0 }]); return <div key={line.product.public_id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-[minmax(0,1fr)_120px_140px_130px_44px] sm:items-start"><div className="min-w-0 pt-2"><p className="truncate text-sm font-medium text-white">{line.product.title}</p><p className="text-xs text-zinc-500">Stock actual: {line.product.stock}</p></div><div><label htmlFor={`purchase-quantity-${line.product.public_id}`} className="text-xs text-zinc-500">Cantidad</label><Input id={`purchase-quantity-${line.product.public_id}`} type="text" inputMode="numeric" pattern="[0-9]*" value={line.quantity} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ""); updateLine(line.product.public_id, { quantity: digits.replace(/^0+(?=\d)/, "") }); }} onBlur={() => setTouchedQuantities((current) => ({ ...current, [line.product.public_id]: true }))} disabled={createPurchase.isPending} aria-invalid={showQuantityError} aria-describedby={showQuantityError ? `purchase-quantity-${line.product.public_id}-error` : undefined} className="mt-1 border-white/10 bg-black/30 text-white" />{showQuantityError && <p id={`purchase-quantity-${line.product.public_id}-error`} className="mt-1 text-xs text-red-400">Entero entre 1 y 100000.</p>}</div><div><label htmlFor={`purchase-price-${line.product.public_id}`} className="text-xs text-zinc-500">Costo unitario</label><Input id={`purchase-price-${line.product.public_id}`} type="text" inputMode="decimal" value={line.unitPrice} onChange={(event) => { const value = event.target.value; if (/^\d*(?:\.\d{0,2})?$/.test(value)) updateLine(line.product.public_id, { unitPrice: value }); }} onBlur={() => setTouchedPrices((current) => ({ ...current, [line.product.public_id]: true }))} disabled={createPurchase.isPending} aria-invalid={showPriceError} aria-describedby={showPriceError ? `purchase-price-${line.product.public_id}-error` : undefined} className="mt-1 border-white/10 bg-black/30 text-white" />{showPriceError && <p id={`purchase-price-${line.product.public_id}-error`} className="mt-1 text-xs text-red-400">Decimal mayor o igual a 0, máximo 2 decimales.</p>}</div><p className="pt-7 text-right text-sm font-medium text-white">{formatSaleMoney(lineTotal)}</p><Button type="button" variant="ghost" size="icon" onClick={() => setLines((current) => current.filter((item) => item.product.public_id !== line.product.public_id))} disabled={createPurchase.isPending} aria-label={`Retirar ${line.product.title}`} className="mt-5 text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></div>; })}</div>}
      </section>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"><span className="text-sm text-zinc-400">Total estimado</span><strong className="text-xl text-white">{formatSaleMoney(estimatedTotal)}</strong></div>
      {errorMessage && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}
      {!createPurchase.isPending && guidance && <p className="text-sm text-zinc-400" aria-live="polite">{guidance}</p>}
      <DialogFooter><Button type="button" variant="outline" onClick={resetAndClose} disabled={createPurchase.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="submit" disabled={!canSubmit || createPurchase.isPending} className="bg-red-500 text-white hover:bg-red-600">{createPurchase.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Registrando...</> : "Registrar compra"}</Button></DialogFooter>
    </form>
    <CreateSupplierDialog businessPublicId={businessPublicId} open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen} onCreated={(supplier) => { setSelectedSupplier(supplier); setSupplierPublicId(supplier.public_id); }} />
  </DialogContent></Dialog>;
}
