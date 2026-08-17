"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomers } from "@/hooks/use-customers";
import { useEmployees } from "@/hooks/use-employees";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { productKeys, useProducts } from "@/hooks/use-products";
import { useCreateSale } from "@/hooks/use-transactions";
import { findStatusByName } from "@/lib/catalog-status";
import { HttpError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import CreateCustomerDialog from "@/components/customers/create-customer-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { calculateEstimatedTotal, formatSaleMoney } from "@/components/sales/sales-format";
import type { EmployeeOption } from "@/types/employee";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";

const EMPLOYEE_PAGE_SIZE = 50;
const PRODUCT_PAGE_SIZE = 10;
const CUSTOMER_PAGE_SIZE = 10;

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
    return error instanceof Error ? error.message : "No fue posible registrar la venta.";
  }
  const data = error.data as Record<string, unknown>;
  const preferred = data.details ?? data.detail;
  if (typeof preferred === "string") return preferred;
  if (Array.isArray(preferred) && typeof preferred[0] === "string") return preferred[0];
  for (const value of Object.values(data)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return error.message;
}

export default function CreateSaleDialog({ businessPublicId, initialEmployeePublicId, open, onOpenChange, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [employeePage, setEmployeePage] = useState(1);
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerSearchInput, setCustomerSearchInput] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPublicId, setCustomerPublicId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touchedQuantities, setTouchedQuantities] = useState<Record<string, boolean>>({});
  const createSale = useCreateSale();
  const resetCreateSale = createSale.reset;
  const statusesQuery = useEntityStatuses(open);
  const activeStatus = findStatusByName(statusesQuery.data?.results ?? [], "Activo");

  const employeesQuery = useEmployees({ businessPublicId: open ? businessPublicId : undefined, page: employeePage, pageSize: EMPLOYEE_PAGE_SIZE });
  const customersQuery = useCustomers({ businessPublicId: open ? businessPublicId : undefined, page: customerPage, pageSize: CUSTOMER_PAGE_SIZE, search: customerSearch, ordering: "full_name" });
  const productsQuery = useProducts({ businessPublicId: open && activeStatus ? businessPublicId : undefined, page: productPage, pageSize: PRODUCT_PAGE_SIZE, search: productSearch, statusPublicId: activeStatus?.public_id });

  useEffect(() => {
    const timeout = setTimeout(() => { setProductSearch(productSearchInput.trim()); setProductPage(1); }, 400);
    return () => clearTimeout(timeout);
  }, [productSearchInput]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCustomerSearch(customerSearchInput.trim());
      setCustomerPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [customerSearchInput]);

  useEffect(() => {
    if (!open) return;
    setEmployeePage(1);
    setEmployeePublicId(initialEmployeePublicId ?? "");
    setSelectedEmployee(null);
    setCustomerPage(1);
    setCustomerSearchInput("");
    setCustomerSearch("");
    setCustomerPublicId("");
    setSelectedCustomer(null);
    setCustomerDialogOpen(false);
    setProductPage(1);
    setProductSearchInput("");
    setProductSearch("");
    setLines([]);
    setAttemptedSubmit(false);
    setTouchedQuantities({});
    resetCreateSale();
  }, [open, businessPublicId, initialEmployeePublicId, resetCreateSale]);

  useEffect(() => {
    if (!employeePublicId) { setSelectedEmployee(null); return; }
    const match = employeesQuery.data?.results.find((employee) => employee.public_id === employeePublicId);
    if (match) setSelectedEmployee(match);
  }, [employeePublicId, employeesQuery.data]);

  useEffect(() => {
    if (
      !open ||
      !initialEmployeePublicId ||
      employeePublicId !== initialEmployeePublicId ||
      selectedEmployee ||
      !employeesQuery.isSuccess ||
      employeesQuery.data.results.some(
        (employee) => employee.public_id === initialEmployeePublicId
      ) ||
      !employeesQuery.data.next
    ) {
      return;
    }

    setEmployeePage((page) => page + 1);
  }, [
    employeePublicId,
    employeesQuery.data,
    employeesQuery.isSuccess,
    initialEmployeePublicId,
    open,
    selectedEmployee,
  ]);

  const employees = useMemo(() => {
    const listed = employeesQuery.data?.results ?? [];
    return selectedEmployee && !listed.some((employee) => employee.public_id === selectedEmployee.public_id)
      ? [selectedEmployee, ...listed] : listed;
  }, [employeesQuery.data, selectedEmployee]);

  const customers = useMemo(() => {
    const listed = customersQuery.data?.results ?? [];
    return selectedCustomer && !listed.some((customer) => customer.public_id === selectedCustomer.public_id)
      ? [selectedCustomer, ...listed]
      : listed;
  }, [customersQuery.data, selectedCustomer]);

  const invalidLines = lines.filter((line) => {
    const quantity = Number(line.quantity);
    return !line.quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > line.product.stock;
  });
  const estimatedTotal = calculateEstimatedTotal(lines.map((line) => ({ unitPrice: line.product.base_price, quantity: Number(line.quantity) })));
  const canSubmit = Boolean(businessPublicId && employeePublicId && lines.length > 0 && invalidLines.length === 0);
  const guidance = !businessPublicId ? "No hay un negocio activo para registrar la venta." : !employeePublicId ? "Selecciona el Employee responsable de la venta." : lines.length === 0 ? "Agrega al menos un producto." : invalidLines.length > 0 ? "Corrige las cantidades antes de registrar la venta." : null;

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
        payment_status: "paid",
        details: lines.map((line) => ({ product_public_id: line.product.public_id, quantity: Number(line.quantity) })),
      });
      onCreated();
      onOpenChange(false);
    } catch (error) {
      const message = firstApiMessage(error).toLocaleLowerCase();
      if (error instanceof HttpError && error.status === 400 && message.includes("stock") && message.includes("insuficiente")) {
        await queryClient.invalidateQueries({ queryKey: productKeys.byBusiness(businessPublicId) });
      }
    }
  }

  const errorMessage = createSale.error ? firstApiMessage(createSale.error) : null;

  return <Dialog open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()}>
    <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-5xl">
      <DialogHeader><DialogTitle>Nueva venta</DialogTitle><DialogDescription className="text-zinc-500">Registra una venta pagada. El precio y el stock definitivos serán validados por PlayNow API.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-2">
          <label htmlFor="sale-employee" className="text-sm font-medium text-zinc-300">Employee responsable</label>
          <select id="sale-employee" value={employeePublicId} onChange={(event) => { const id = event.target.value; setEmployeePublicId(id); setSelectedEmployee(employees.find((employee) => employee.public_id === id) ?? null); }} disabled={employeesQuery.isLoading || createSale.isPending} aria-invalid={attemptedSubmit && !employeePublicId} aria-describedby={attemptedSubmit && !employeePublicId ? "sale-employee-error" : undefined} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50">
            <option value="">{employeesQuery.isLoading ? "Cargando Employees..." : "Selecciona un Employee"}</option>
            {employeePublicId && !selectedEmployee && !employees.some((employee) => employee.public_id === employeePublicId) && <option value={employeePublicId}>Employee asociado a tu membresía (busca su nombre en las páginas)</option>}
            {employees.map((employee) => <option key={employee.public_id} value={employee.public_id}>{employee.full_name} · {employee.position}</option>)}
          </select>
          {attemptedSubmit && !employeePublicId && <p id="sale-employee-error" className="text-xs text-red-400">Selecciona el Employee responsable.</p>}
          {employeesQuery.isError && <p role="alert" className="text-sm text-red-300">No fue posible cargar los Employees.</p>}
          {employeesQuery.data && employeesQuery.data.total_pages > 1 && <div className="flex items-center justify-end gap-2"><Button type="button" size="sm" variant="outline" disabled={!employeesQuery.data.previous || createSale.isPending} onClick={() => setEmployeePage((page) => Math.max(1, page - 1))} className="border-white/10 bg-transparent text-zinc-300">Anterior</Button><span className="text-xs text-zinc-500">Página {employeesQuery.data.current_page} de {employeesQuery.data.total_pages}</span><Button type="button" size="sm" variant="outline" disabled={!employeesQuery.data.next || createSale.isPending} onClick={() => setEmployeePage((page) => page + 1)} className="border-white/10 bg-transparent text-zinc-300">Siguiente</Button></div>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <label htmlFor="sale-customer" className="text-sm font-medium text-zinc-300">
                Cliente (opcional)
              </label>
              <p className="mt-1 text-xs text-zinc-500">Puedes registrar la venta sin cliente.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomerDialogOpen(true)}
              disabled={!businessPublicId || createSale.isPending}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="search"
              value={customerSearchInput}
              onChange={(event) => setCustomerSearchInput(event.target.value)}
              placeholder="Buscar cliente..."
              aria-label="Buscar cliente para la venta"
              disabled={createSale.isPending}
              className="h-11 border-white/10 bg-black/30 pl-10 text-white"
            />
          </div>

          <select
            id="sale-customer"
            value={customerPublicId}
            onChange={(event) => {
              const publicId = event.target.value;
              setCustomerPublicId(publicId);
              setSelectedCustomer(
                customers.find((customer) => customer.public_id === publicId) ?? null
              );
            }}
            disabled={customersQuery.isLoading || createSale.isPending}
            className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"
          >
            <option value="">Sin cliente</option>
            {customers.map((customer) => (
              <option key={customer.public_id} value={customer.public_id}>
                {customer.full_name} · {customer.phone}
              </option>
            ))}
          </select>

          {customersQuery.isError && (
            <div className="flex items-center justify-between gap-3 text-sm text-red-300">
              <span>No fue posible cargar los clientes.</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => customersQuery.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {customersQuery.data && customersQuery.data.total_pages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" disabled={!customersQuery.data.previous || createSale.isPending} onClick={() => setCustomerPage((page) => Math.max(1, page - 1))} className="border-white/10 bg-transparent text-zinc-300">
                Anterior
              </Button>
              <span className="text-xs text-zinc-500">Página {customersQuery.data.current_page} de {customersQuery.data.total_pages}</span>
              <Button type="button" variant="outline" size="sm" disabled={!customersQuery.data.next || createSale.isPending} onClick={() => setCustomerPage((page) => page + 1)} className="border-white/10 bg-transparent text-zinc-300">
                Siguiente
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div><h3 className="font-medium text-white">Agregar productos</h3><p className="mt-1 text-sm text-zinc-500">Solo se consultan productos con estado Activo.</p></div>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input type="search" value={productSearchInput} onChange={(event) => setProductSearchInput(event.target.value)} placeholder="Buscar productos..." aria-label="Buscar productos para la venta" className="h-11 border-white/10 bg-black/30 pl-10 text-white" /></div>
          {statusesQuery.isSuccess && !activeStatus && <p role="alert" className="text-sm text-amber-300">No existe el estado Activo necesario para consultar productos.</p>}
          {productsQuery.isLoading && <p className="text-sm text-zinc-500">Cargando productos...</p>}
          {productsQuery.isError && <div className="flex items-center justify-between gap-3 text-sm text-red-300"><span>No fue posible cargar los productos.</span><Button type="button" size="sm" variant="ghost" onClick={() => productsQuery.refetch()}>Reintentar</Button></div>}
          {productsQuery.data && <div className="space-y-2">{productsQuery.data.results.length === 0 ? <p className="text-sm text-zinc-500">No hay productos que coincidan con la búsqueda.</p> : productsQuery.data.results.map((product) => { const added = lines.some((line) => line.product.public_id === product.public_id); const soldOut = product.stock <= 0; return <div key={product.public_id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{product.title}</p><p className="mt-1 text-xs text-zinc-500">{formatSaleMoney(product.base_price)} · Disponible: {product.stock}</p></div><Button type="button" size="sm" variant="outline" onClick={() => addProduct(product)} disabled={soldOut || added || createSale.isPending} className="border-white/10 bg-transparent text-zinc-300"><Plus className="h-4 w-4" />{soldOut ? "Agotado" : added ? "Agregado" : "Agregar"}</Button></div>; })}</div>}
          {productsQuery.data && productsQuery.data.total_pages > 1 && <div className="flex items-center justify-end gap-2"><Button type="button" size="sm" variant="outline" disabled={!productsQuery.data.previous} onClick={() => setProductPage((page) => Math.max(1, page - 1))} className="border-white/10 bg-transparent text-zinc-300">Anterior</Button><span className="text-xs text-zinc-500">Página {productsQuery.data.current_page} de {productsQuery.data.total_pages}</span><Button type="button" size="sm" variant="outline" disabled={!productsQuery.data.next} onClick={() => setProductPage((page) => page + 1)} className="border-white/10 bg-transparent text-zinc-300">Siguiente</Button></div>}
        </section>

        <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-medium text-white">Detalle</h3><span className="text-sm text-zinc-500">{lines.length} {lines.length === 1 ? "producto" : "productos"}</span></div>
          {lines.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">Todavía no agregaste productos.</div> : <div className="space-y-2">{lines.map((line) => { const quantity = Number(line.quantity); const invalid = !line.quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > line.product.stock; const showError = invalid && (attemptedSubmit || touchedQuantities[line.product.public_id]); return <div key={line.product.public_id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:grid-cols-[minmax(0,1fr)_120px_140px_44px] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{line.product.title}</p><p className="text-xs text-zinc-500">{formatSaleMoney(line.product.base_price)} · Stock: {line.product.stock}</p></div><div><Input type="text" inputMode="numeric" pattern="[0-9]*" value={line.quantity} onChange={(event) => { const digits = event.target.value.replace(/\D/g, ""); const normalized = digits.replace(/^0+(?=\d)/, ""); setLines((current) => current.map((item) => item.product.public_id === line.product.public_id ? { ...item, quantity: normalized } : item)); }} onBlur={() => setTouchedQuantities((current) => ({ ...current, [line.product.public_id]: true }))} aria-label={`Cantidad de ${line.product.title}`} aria-invalid={showError} aria-describedby={showError ? `quantity-${line.product.public_id}-error` : undefined} className="border-white/10 bg-black/30 text-white" />{showError && <p id={`quantity-${line.product.public_id}-error`} className="mt-1 text-xs text-red-400">Usa un entero entre 1 y {line.product.stock}.</p>}</div><p className="text-right text-sm font-medium text-white">{formatSaleMoney(calculateEstimatedTotal([{ unitPrice: line.product.base_price, quantity }]))}</p><Button type="button" variant="ghost" size="icon" onClick={() => setLines((current) => current.filter((item) => item.product.public_id !== line.product.public_id))} aria-label={`Retirar ${line.product.title}`} className="text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></div>; })}</div>}
        </section>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"><span className="text-sm text-zinc-400">Total estimado</span><strong className="text-xl text-white">{formatSaleMoney(estimatedTotal)}</strong></div>
        {errorMessage && <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}
        {!createSale.isPending && guidance && <p className="text-sm text-zinc-400" aria-live="polite">{guidance}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={resetAndClose} disabled={createSale.isPending} className="border-white/10 bg-transparent text-white">Cancelar</Button><Button type="submit" disabled={!canSubmit || createSale.isPending} className="bg-red-500 text-white hover:bg-red-600">{createSale.isPending ? <><LoaderCircle className="h-4 w-4 animate-spin" />Registrando...</> : "Registrar venta"}</Button></DialogFooter>
      </form>

      <CreateCustomerDialog
        businessPublicId={businessPublicId}
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onCreated={(customer) => {
          setSelectedCustomer(customer);
          setCustomerPublicId(customer.public_id);
        }}
      />
    </DialogContent>
  </Dialog>;
}
