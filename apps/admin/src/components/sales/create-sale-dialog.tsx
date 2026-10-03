"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployee } from "@/hooks/use-employees";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { productKeys } from "@/hooks/use-products";
import { useCreateSale, useRefreshSaleEffects } from "@/hooks/use-transactions";
import { findStatusByName } from "@/lib/catalog-status";
import { extractDrfErrorMessage, getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import CreateCustomerDialog from "@/components/customers/create-customer-dialog";
import SaleCustomerSelectorDialog from "@/components/sales/sale-customer-selector-dialog";
import SaleEmployeeSelectorDialog from "@/components/sales/sale-employee-selector-dialog";
import SaleProductSelectorDialog from "@/components/sales/sale-product-selector-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { calculateEstimatedTotal, formatSaleMoney, subtractMoney, toMoneyMinorUnits } from "@/components/sales/sales-format";
import type { EmployeeOption } from "@/types/employee";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type { PaymentStatus } from "@/types/transaction";

const PAYMENT_METHOD_PAGE_SIZE = 100;
const PAYMENT_METHOD_TYPE_LABELS = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", other: "Otro" } as const;
const API_FIELD_LABELS: Record<string, string> = {
  customer_public_id: "Cliente",
  employee_public_id: "Empleado",
  payment_method_public_id: "Método de pago",
  payment_status: "Estado de pago",
  initial_paid_amount: "Pago inicial",
  details: "Detalle",
};

type SaleLine = { product: Product; quantity: string };
type Props = {
  businessPublicId?: string;
  initialEmployeePublicId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

function firstApiMessage(error: unknown) {
  if (!(error instanceof HttpError) || typeof error.data !== "object" || error.data === null) {
    return getApiErrorMessage(error, "No fue posible registrar la venta.");
  }
  const data = error.data as Record<string, unknown>;
  const preferred = data.details ?? data.detail;
  const preferredMessage = extractDrfErrorMessage(preferred);
  if (preferredMessage) return preferredMessage;
  for (const [field, value] of Object.entries(data)) {
    const message = extractDrfErrorMessage(value);
    if (message) return `${API_FIELD_LABELS[field] ?? field}: ${message}`;
  }
  if (error.status === 403) return "No tienes permisos para registrar esta venta.";
  if (error.status === 404) return "Uno de los recursos seleccionados ya no está disponible para este negocio.";
  return error.status === 409 ? "La operación cambió mientras registrabas la venta. Revisa los datos e inténtalo nuevamente." : getApiErrorMessage(error, "No fue posible registrar la venta.");
}

export default function CreateSaleDialog({ businessPublicId, initialEmployeePublicId, open, onOpenChange, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [employeeSelectorOpen, setEmployeeSelectorOpen] = useState(false);
  const [customerPublicId, setCustomerPublicId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSelectorOpen, setCustomerSelectorOpen] = useState(false);
  const [createCustomerDialogOpen, setCreateCustomerDialogOpen] = useState(false);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [paymentMethodPublicId, setPaymentMethodPublicId] = useState("");
  const [initialPaidAmount, setInitialPaidAmount] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touchedQuantities, setTouchedQuantities] = useState<Record<string, boolean>>({});
  const createSale = useCreateSale();
  const refreshSaleEffects = useRefreshSaleEffects();
  const resetCreateSale = createSale.reset;
  const statusesQuery = useEntityStatuses(open);
  const activeStatus = findStatusByName(statusesQuery.data?.results ?? [], "Activo");

  const initialEmployeeQuery = useEmployee({
    businessPublicId:
      open && initialEmployeePublicId
        ? businessPublicId
        : undefined,
    publicId:
      open
        ? initialEmployeePublicId ?? undefined
        : undefined,
  });
  const paymentMethodsQuery = usePaymentMethods({ businessPublicId: open ? businessPublicId : undefined, page: 1, pageSize: PAYMENT_METHOD_PAGE_SIZE, ordering: "name" });

  useEffect(() => {
    if (!open) return;
    setEmployeePublicId(initialEmployeePublicId ?? "");
    setSelectedEmployee(null);
    setEmployeeSelectorOpen(false);
    setCustomerPublicId(null);
    setSelectedCustomer(null);
    setCustomerSelectorOpen(false);
    setCreateCustomerDialogOpen(false);
    setProductSelectorOpen(false);
    setLines([]);
    setPaymentStatus("paid");
    setPaymentMethodPublicId("");
    setInitialPaidAmount("");
    setAttemptedSubmit(false);
    setTouchedQuantities({});
    resetCreateSale();
  }, [open, businessPublicId, initialEmployeePublicId, resetCreateSale]);

  useEffect(() => {
    if (
      !open ||
      !initialEmployeePublicId ||
      employeePublicId !== initialEmployeePublicId ||
      selectedEmployee ||
      !initialEmployeeQuery.data ||
      initialEmployeeQuery.data.business_public_id !== businessPublicId
    ) {
      return;
    }

    setSelectedEmployee({
      public_id: initialEmployeeQuery.data.public_id,
      full_name: initialEmployeeQuery.data.full_name,
      position: initialEmployeeQuery.data.position,
    });
  }, [
    businessPublicId,
    employeePublicId,
    initialEmployeeQuery.data,
    initialEmployeePublicId,
    open,
    selectedEmployee,
  ]);

  const selectedProductIds = useMemo(
    () => new Set(lines.map((line) => line.product.public_id)),
    [lines]
  );

  const invalidLines = lines.filter((line) => {
    const quantity = Number(line.quantity);
    return !line.quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > line.product.stock;
  });
  const estimatedTotal = calculateEstimatedTotal(lines.map((line) => ({ unitPrice: line.product.base_price, quantity: Number(line.quantity) })));
  const estimatedTotalMinor = toMoneyMinorUnits(estimatedTotal) ?? 0n;
  const hasPositiveTotal = estimatedTotalMinor > 0n;
  const requiresCustomer = hasPositiveTotal && (paymentStatus === "pending" || paymentStatus === "partial");
  const requiresPaymentMethod = hasPositiveTotal && (paymentStatus === "paid" || paymentStatus === "partial");
  const initialPaidMinor = toMoneyMinorUnits(initialPaidAmount);
  const validInitialPaidAmount = paymentStatus !== "partial" || (initialPaidMinor !== null && initialPaidMinor > 0n && initialPaidMinor < estimatedTotalMinor);
  const estimatedBalance = subtractMoney(estimatedTotal, initialPaidAmount);
  const canSubmit = Boolean(businessPublicId && employeePublicId && lines.length > 0 && invalidLines.length === 0 && (!requiresCustomer || customerPublicId) && (!requiresPaymentMethod || paymentMethodPublicId) && validInitialPaidAmount);
  const guidance = !businessPublicId ? "No hay un negocio activo para registrar la venta." : !employeePublicId ? "Selecciona al empleado responsable de la venta." : lines.length === 0 ? "Agrega al menos un producto." : invalidLines.length > 0 ? "Corrige las cantidades antes de registrar la venta." : requiresCustomer && !customerPublicId ? "La venta pendiente o parcial necesita un cliente." : requiresPaymentMethod && !paymentMethodPublicId ? "Selecciona el método de pago." : !validInitialPaidAmount ? "El pago inicial debe ser mayor que cero y menor que el total estimado." : null;

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
    if (product.stock <= 0 || lines.some((line) => line.product.public_id === product.public_id)) return;
    setLines((current) => [...current, { product, quantity: "1" }]);
  }

  function resetAndClose() {
    if (createSale.isPending) return;
    resetCreateSale();
    onOpenChange(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || !businessPublicId || createSale.isPending) return;
    try {
      await createSale.mutateAsync({
        business_public_id: businessPublicId,
        ...(customerPublicId ? { customer_public_id: customerPublicId } : {}),
        employee_public_id: employeePublicId,
        type: "sale",
        payment_status: paymentStatus,
        ...(requiresPaymentMethod ? { payment_method_public_id: paymentMethodPublicId } : {}),
        ...(paymentStatus === "partial" ? { initial_paid_amount: initialPaidAmount } : {}),
        details: lines.map((line) => ({ product_public_id: line.product.public_id, quantity: Number(line.quantity) })),
      });
      onCreated();
      onOpenChange(false);
    } catch (error) {
      const message = firstApiMessage(error).toLocaleLowerCase();
      if (error instanceof HttpError && error.status === 400 && message.includes("stock") && message.includes("insuficiente")) {
        await queryClient.invalidateQueries({ queryKey: productKeys.byBusiness(businessPublicId) });
      }
      if (error instanceof HttpError && error.status === 409) await refreshSaleEffects(businessPublicId);
    }
  }

  const errorMessage = createSale.error ? firstApiMessage(createSale.error) : null;

  return <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()}>
    <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
      <DialogHeader><DialogTitle>Nueva venta</DialogTitle><DialogDescription className="text-zinc-500">Registra una venta pagada, pendiente o parcial.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section
          className="space-y-2"
          aria-labelledby="sale-employee-label"
          aria-describedby={attemptedSubmit && !employeePublicId ? "sale-employee-error" : undefined}
        >
          <h3 id="sale-employee-label" className="text-sm font-medium text-zinc-300">Empleado responsable</h3>
          <div
            className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              attemptedSubmit && !employeePublicId
                ? "border-red-500/50 bg-red-500/5"
                : employeePublicId
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-dashed border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {employeePublicId
                  ? "Empleado seleccionado"
                  : "Sin empleado seleccionado"}
              </p>
              {employeePublicId && (
                <>
                  <p className="mt-1 truncate text-sm font-medium text-white">
                    {selectedEmployee?.full_name ??
                      (initialEmployeeQuery.isLoading
                        ? "Cargando empleado..."
                        : "Empleado asociado a tu membresía")}
                  </p>
                  {selectedEmployee?.position && (
                    <p className="mt-1 truncate text-xs text-zinc-400">
                      {selectedEmployee.position}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                type="button"
                variant="inverseOutline"
                size={employeePublicId ? "sm" : "default"}
                onClick={() => setEmployeeSelectorOpen(true)}
                disabled={!businessPublicId || !activeStatus || createSale.isPending}
                aria-invalid={attemptedSubmit && !employeePublicId}
              >
                {employeePublicId ? "Cambiar" : "Seleccionar empleado"}
              </Button>

              {employeePublicId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEmployeePublicId("");
                    setSelectedEmployee(null);
                  }}
                  disabled={createSale.isPending}
                  aria-label="Quitar empleado responsable de la venta"
                  className="text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  Quitar
                </Button>
              )}
            </div>
          </div>
          {attemptedSubmit && !employeePublicId && <p id="sale-employee-error" className="text-xs text-red-400">Selecciona al empleado responsable.</p>}
          {initialEmployeeQuery.isError && employeePublicId === initialEmployeePublicId && !selectedEmployee && <p role="alert" className="text-sm text-red-300">No fue posible cargar los datos del empleado asociado.</p>}
          {statusesQuery.isError && <p role="alert" className="text-sm text-red-300">No fue posible encontrar el estado Activo de los empleados.</p>}
          {statusesQuery.isSuccess && !activeStatus && <p role="alert" className="text-sm text-amber-300">No existe el estado Activo necesario para consultar empleados.</p>}
        </section>

        <section
          className="space-y-3"
          aria-labelledby="sale-customer-label"
          aria-describedby={
            attemptedSubmit && requiresCustomer && !customerPublicId
              ? "sale-customer-description sale-customer-error"
              : "sale-customer-description"
          }
        >
          <div>
            <h3 id="sale-customer-label" className="text-sm font-medium text-zinc-300">
              Cliente {requiresCustomer ? "(obligatorio)" : "(opcional)"}
            </h3>
            <p id="sale-customer-description" className="mt-1 text-xs text-zinc-500">
              {requiresCustomer
                ? "Las ventas pendientes o parciales requieren cliente."
                : "Puedes registrar la venta pagada sin cliente."}
            </p>
          </div>

          {selectedCustomer ? (
            <div
              className={`flex flex-col gap-4 rounded-xl border bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between ${
                attemptedSubmit && requiresCustomer && !customerPublicId
                  ? "border-red-500/50"
                  : "border-white/10"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {selectedCustomer.full_name}
                </p>
                {selectedCustomer.phone && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {selectedCustomer.phone}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="inverseOutline"
                  size="sm"
                  onClick={() => setCustomerSelectorOpen(true)}
                  disabled={!businessPublicId || createSale.isPending}
                >
                  Cambiar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomerPublicId(null);
                    setSelectedCustomer(null);
                  }}
                  disabled={createSale.isPending}
                  aria-label={`Quitar a ${selectedCustomer.full_name} de la venta`}
                  className="text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  Quitar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateCustomerDialogOpen(true)}
                  disabled={!businessPublicId || createSale.isPending}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo cliente
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between ${
                attemptedSubmit && requiresCustomer
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <p className="text-sm text-zinc-500">Sin cliente seleccionado.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="inverseOutline"
                  onClick={() => setCustomerSelectorOpen(true)}
                  disabled={!businessPublicId || createSale.isPending}
                  aria-invalid={attemptedSubmit && requiresCustomer}
                >
                  Seleccionar cliente
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateCustomerDialogOpen(true)}
                  disabled={!businessPublicId || createSale.isPending}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo cliente
                </Button>
              </div>
            </div>
          )}

          {attemptedSubmit && requiresCustomer && !customerPublicId && (
            <p id="sale-customer-error" className="text-xs text-red-400">
              Selecciona un cliente para la venta pendiente o parcial.
            </p>
          )}
        </section>

        <section className="space-y-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-medium text-white">Detalle</h3><p className="mt-1 text-sm text-zinc-500">{lines.length} {lines.length === 1 ? "producto agregado" : "productos agregados"}</p></div><Button type="button" variant="inverseOutline" onClick={() => setProductSelectorOpen(true)} disabled={!businessPublicId || !activeStatus || createSale.isPending}>Agregar productos</Button></div>
          {lines.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-sm text-zinc-500">Todavía no agregaste productos.</div> : <div className="space-y-2">{lines.map((line) => { const quantity = Number(line.quantity); const invalid = !line.quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > line.product.stock; const showError = invalid && (attemptedSubmit || touchedQuantities[line.product.public_id]); return <div key={line.product.public_id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-[minmax(0,1fr)_120px_140px_44px] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{line.product.title}</p><p className="text-xs text-zinc-500">{formatSaleMoney(line.product.base_price)} · Stock: {line.product.stock}</p></div><div><Input type="text" inputMode="numeric" pattern="[0-9]*" value={line.quantity} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ""); const normalized = digits.replace(/^0+(?=\d)/, ""); setLines((current) => current.map((item) => item.product.public_id === line.product.public_id ? { ...item, quantity: normalized } : item)); }} onBlur={() => setTouchedQuantities((current) => ({ ...current, [line.product.public_id]: true }))} aria-label={`Cantidad de ${line.product.title}`} aria-invalid={showError} aria-describedby={showError ? `quantity-${line.product.public_id}-error` : undefined} className="border-white/10 bg-black/30 text-white" />{showError && <p id={`quantity-${line.product.public_id}-error`} className="mt-1 text-xs text-red-400">Usa un entero entre 1 y {line.product.stock}.</p>}</div><p className="text-right text-sm font-medium text-white">{formatSaleMoney(calculateEstimatedTotal([{ unitPrice: line.product.base_price, quantity }]))}</p><Button type="button" variant="ghost" size="icon" onClick={() => setLines((current) => current.filter((item) => item.product.public_id !== line.product.public_id))} aria-label={`Retirar ${line.product.title}`} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></div>; })}</div>}
        </section>

        <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Total estimado</span><strong className="text-xl text-white">{formatSaleMoney(estimatedTotal)}</strong></div>
          <div className="space-y-2"><label htmlFor="sale-payment-status" className="text-sm font-medium text-zinc-300">Estado de pago</label><select id="sale-payment-status" value={paymentStatus} onChange={(event) => changePaymentStatus(event.target.value as PaymentStatus)} disabled={!hasPositiveTotal || createSale.isPending} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"><option value="paid">Pagado</option><option value="pending">Pendiente</option><option value="partial">Parcial</option></select>{!hasPositiveTotal && <p className="text-xs text-zinc-500">Con total estimado cero, la operación solo puede registrarse como pagada y sin método de pago.</p>}</div>
          {requiresPaymentMethod && <div className="space-y-2"><label htmlFor="sale-payment-method" className="text-sm font-medium text-zinc-300">Método de pago</label><select id="sale-payment-method" value={paymentMethodPublicId} onChange={(event) => setPaymentMethodPublicId(event.target.value)} disabled={paymentMethodsQuery.isLoading || createSale.isPending} aria-invalid={attemptedSubmit && !paymentMethodPublicId} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"><option value="">{paymentMethodsQuery.isLoading ? "Cargando métodos..." : "Selecciona un método"}</option>{paymentMethodsQuery.data?.results.map((method) => <option key={method.public_id} value={method.public_id}>{method.name} · {PAYMENT_METHOD_TYPE_LABELS[method.method_type]}</option>)}</select>{attemptedSubmit && !paymentMethodPublicId && <p className="text-xs text-red-400">Selecciona un método de pago.</p>}{paymentMethodsQuery.isError && <div className="flex items-center justify-between gap-3 text-sm text-red-300"><span>No fue posible cargar los métodos de pago.</span><Button type="button" variant="ghost" size="sm" onClick={() => paymentMethodsQuery.refetch()}>Reintentar</Button></div>}</div>}
          {paymentStatus === "partial" && hasPositiveTotal && <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="sale-initial-paid-amount" className="text-sm font-medium text-zinc-300">Importe pagado inicialmente</label><Input id="sale-initial-paid-amount" type="text" inputMode="decimal" value={initialPaidAmount} onChange={(event) => { const value = event.target.value; if (/^\d*(?:\.\d{0,2})?$/.test(value)) setInitialPaidAmount(value); }} disabled={createSale.isPending} aria-invalid={attemptedSubmit && !validInitialPaidAmount} className="border-white/10 bg-black/30 text-white" />{attemptedSubmit && !validInitialPaidAmount && <p className="text-xs text-red-400">Debe ser mayor que cero y menor que el total estimado.</p>}</div><div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4"><span className="text-sm text-zinc-400">Saldo estimado</span><strong className="text-white">{formatSaleMoney(estimatedBalance)}</strong></div></div>}
        </section>
        {errorMessage && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}
        {!createSale.isPending && guidance && <p className="text-sm text-zinc-400" aria-live="polite">{guidance}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={resetAndClose} disabled={createSale.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="submit" disabled={!canSubmit || createSale.isPending} className="bg-red-500 text-white hover:bg-red-600">{createSale.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Registrando...</> : "Registrar venta"}</Button></DialogFooter>
      </form>

      <CreateCustomerDialog
        businessPublicId={businessPublicId}
        open={createCustomerDialogOpen}
        onOpenChange={setCreateCustomerDialogOpen}
        onCreated={(customer) => {
          setSelectedCustomer(customer);
          setCustomerPublicId(customer.public_id);
        }}
      />
      <SaleCustomerSelectorDialog
        businessPublicId={businessPublicId}
        selectedCustomer={selectedCustomer}
        open={customerSelectorOpen}
        disabled={createSale.isPending}
        onOpenChange={setCustomerSelectorOpen}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          setCustomerPublicId(customer.public_id);
        }}
      />
      <SaleEmployeeSelectorDialog
        businessPublicId={businessPublicId}
        activeStatusPublicId={activeStatus?.public_id}
        selectedEmployee={selectedEmployee}
        open={employeeSelectorOpen}
        disabled={createSale.isPending}
        onOpenChange={setEmployeeSelectorOpen}
        onSelect={(employee) => {
          setSelectedEmployee(employee);
          setEmployeePublicId(employee.public_id);
        }}
      />
      <SaleProductSelectorDialog
        businessPublicId={businessPublicId}
        activeStatusPublicId={activeStatus?.public_id}
        selectedProductIds={selectedProductIds}
        open={productSelectorOpen}
        disabled={createSale.isPending}
        onOpenChange={setProductSelectorOpen}
        onAdd={addProduct}
      />
    </DialogContent>
  </Dialog>;
}
