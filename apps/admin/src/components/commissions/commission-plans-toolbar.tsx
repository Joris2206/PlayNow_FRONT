"use client";

import { Plus } from "lucide-react";
import CommissionEmployeeSelect from "@/components/commissions/commission-employee-select";
import { Button } from "@/components/ui/button";
import type { CommissionPlanOrdering } from "@/types/commission";
import type { EmployeeOption } from "@/types/employee";

type Props = {
  businessPublicId?: string;
  employeePublicId: string;
  selectedEmployee: EmployeeOption | null;
  onEmployeeChange: (value: string, employee: EmployeeOption | null) => void;
  activeFilter: "all" | "active" | "inactive";
  onActiveFilterChange: (value: "all" | "active" | "inactive") => void;
  ordering: CommissionPlanOrdering;
  onOrderingChange: (value: CommissionPlanOrdering) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onCreate: () => void;
};

const ORDERING_OPTIONS: ReadonlyArray<[CommissionPlanOrdering, string]> = [
  ["-valid_from", "Vigencia más reciente"],
  ["valid_from", "Vigencia más antigua"],
  ["-valid_until", "Fin más reciente"],
  ["valid_until", "Fin más antiguo"],
  ["-percentage", "Porcentaje mayor"],
  ["percentage", "Porcentaje menor"],
  ["-created_at", "Creación más reciente"],
  ["created_at", "Creación más antigua"],
];

export default function CommissionPlansToolbar(props: Props) {
  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-2 xl:grid-cols-5 xl:items-end">
      <CommissionEmployeeSelect
        id="commission-plan-filter-employee"
        label="Empleado"
        businessPublicId={props.businessPublicId}
        value={props.employeePublicId}
        selectedEmployee={props.selectedEmployee}
        onChange={props.onEmployeeChange}
      />
      <label className="space-y-2 text-sm font-medium text-zinc-300">
        Estado
        <select
          value={props.activeFilter}
          onChange={(event) =>
            props.onActiveFilterChange(
              event.target.value as Props["activeFilter"]
            )
          }
          className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-red-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-zinc-300">
        Orden
        <select
          value={props.ordering}
          onChange={(event) =>
            props.onOrderingChange(
              event.target.value as CommissionPlanOrdering
            )
          }
          className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-red-500"
        >
          {ORDERING_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-zinc-300">
        Por página
        <select
          value={props.pageSize}
          onChange={(event) =>
            props.onPageSizeChange(Number(event.target.value))
          }
          className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-red-500"
        >
          {[20, 50, 100, 200].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        onClick={props.onCreate}
        disabled={!props.businessPublicId}
        className="h-11 bg-red-500 text-white hover:bg-red-600"
      >
        <Plus className="h-4 w-4" /> Nuevo plan
      </Button>
    </div>
  );
}
