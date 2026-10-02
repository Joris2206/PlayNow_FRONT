"use client";

import CommissionEmployeeSelect from "@/components/commissions/commission-employee-select";
import DateInput from "@/components/shared/date-input";
import type {
  CommissionSettlementOrdering,
  CommissionSettlementStatus,
} from "@/types/commission";
import type { EmployeeOption } from "@/types/employee";

type Props = {
  businessPublicId?: string;
  employeePublicId: string;
  selectedEmployee: EmployeeOption | null;
  onEmployeeChange: (value: string, employee: EmployeeOption | null) => void;
  status: CommissionSettlementStatus | "";
  onStatusChange: (value: CommissionSettlementStatus | "") => void;
  periodStart: string;
  onPeriodStartChange: (value: string) => void;
  periodEnd: string;
  onPeriodEndChange: (value: string) => void;
  ordering: CommissionSettlementOrdering;
  onOrderingChange: (value: CommissionSettlementOrdering) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
};

const ORDERING_OPTIONS: ReadonlyArray<
  [CommissionSettlementOrdering, string]
> = [
  ["-period_end,-created_at", "Período y creación más recientes"],
  ["-period_end", "Período más reciente"],
  ["period_end", "Período más antiguo"],
  ["-period_start", "Inicio más reciente"],
  ["period_start", "Inicio más antiguo"],
  ["-commission_total", "Comisión mayor"],
  ["commission_total", "Comisión menor"],
  ["-sales_total", "Ventas mayores"],
  ["sales_total", "Ventas menores"],
  ["-created_at", "Creación más reciente"],
  ["created_at", "Creación más antigua"],
  ["-paid_at", "Pago más reciente"],
  ["paid_at", "Pago más antiguo"],
];

export default function CommissionSettlementsToolbar(props: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-3">
      <CommissionEmployeeSelect id="settlement-filter-employee" label="Empleado" businessPublicId={props.businessPublicId} value={props.employeePublicId} selectedEmployee={props.selectedEmployee} onChange={props.onEmployeeChange} />
      <label className="space-y-2 text-sm font-medium text-zinc-300">Estado<select value={props.status} onChange={(event) => props.onStatusChange(event.target.value as Props["status"])} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-red-500"><option value="">Todos</option><option value="pending">Pendiente</option><option value="paid">Pagada</option><option value="cancelled">Cancelada</option></select></label>
      <label className="space-y-2 text-sm font-medium text-zinc-300">Inicio exacto<DateInput aria-label="Inicio exacto del período" pickerLabel="Abrir calendario de inicio del período" value={props.periodStart} onChange={(event) => props.onPeriodStartChange(event.target.value)} className="border-white/10 bg-black/30 text-white" /></label>
      <label className="space-y-2 text-sm font-medium text-zinc-300">Fin exacto<DateInput aria-label="Fin exacto del período" pickerLabel="Abrir calendario de fin del período" value={props.periodEnd} onChange={(event) => props.onPeriodEndChange(event.target.value)} className="border-white/10 bg-black/30 text-white" /></label>
      <label className="space-y-2 text-sm font-medium text-zinc-300">Orden<select value={props.ordering} onChange={(event) => props.onOrderingChange(event.target.value as CommissionSettlementOrdering)} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-red-500">{ORDERING_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="space-y-2 text-sm font-medium text-zinc-300">Por página<select value={props.pageSize} onChange={(event) => props.onPageSizeChange(Number(event.target.value))} className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-red-500">{[20, 50, 100, 200].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
    </div>
  );
}
