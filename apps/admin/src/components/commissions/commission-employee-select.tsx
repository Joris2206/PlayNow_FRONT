"use client";

import { useEffect, useMemo, useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useEntityStatuses } from "@/hooks/use-entity-statuses";
import { findStatusByName } from "@/lib/catalog-status";
import { Button } from "@/components/ui/button";
import type { EmployeeOption } from "@/types/employee";

const PAGE_SIZE = 20;

type Props = {
  id: string;
  label: string;
  businessPublicId?: string;
  value: string;
  onChange: (publicId: string, employee: EmployeeOption | null) => void;
  selectedEmployee?: EmployeeOption | null;
  activeOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
};

export default function CommissionEmployeeSelect({
  id,
  label,
  businessPublicId,
  value,
  onChange,
  selectedEmployee,
  activeOnly = false,
  disabled = false,
  required = false,
  invalid = false,
}: Props) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [businessPublicId, activeOnly]);

  const statusesQuery = useEntityStatuses(
    Boolean(businessPublicId && activeOnly)
  );
  const activeStatus = activeOnly
    ? findStatusByName(statusesQuery.data?.results ?? [], "Activo")
    : undefined;
  const employeesQuery = useEmployees({
    businessPublicId:
      businessPublicId && (!activeOnly || activeStatus)
        ? businessPublicId
        : undefined,
    page,
    pageSize: PAGE_SIZE,
    ordering: "full_name",
    statusPublicId: activeStatus?.public_id,
  });
  const employees = useMemo(() => {
    const listed = employeesQuery.data?.results ?? [];
    if (
      selectedEmployee &&
      !listed.some(
        (employee) => employee.public_id === selectedEmployee.public_id
      )
    ) {
      return [selectedEmployee, ...listed];
    }
    return listed;
  }, [employeesQuery.data, selectedEmployee]);

  const unavailableActiveStatus = Boolean(
    activeOnly && statusesQuery.isSuccess && !activeStatus
  );
  const loading =
    employeesQuery.isLoading || (activeOnly && statusesQuery.isLoading);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        required={required}
        aria-invalid={invalid}
        disabled={disabled || loading || unavailableActiveStatus}
        onChange={(event) => {
          const publicId = event.target.value;
          onChange(
            publicId,
            employees.find(
              (employee) => employee.public_id === publicId
            ) ?? null
          );
        }}
        className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:opacity-50"
      >
        <option value="">
          {loading ? "Cargando empleados..." : "Selecciona un empleado"}
        </option>
        {employees.map((employee) => (
          <option key={employee.public_id} value={employee.public_id}>
            {employee.full_name}
            {employee.position ? ` · ${employee.position}` : ""}
          </option>
        ))}
      </select>

      {(employeesQuery.isError || statusesQuery.isError) && (
        <p role="alert" className="text-xs text-red-400">
          No fue posible cargar los empleados.
        </p>
      )}
      {unavailableActiveStatus && (
        <p role="alert" className="text-xs text-amber-300">
          No está disponible el estado Activo necesario para consultar empleados.
        </p>
      )}
      {employeesQuery.data && employeesQuery.data.total_pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || !employeesQuery.data.previous}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="border-white/10 bg-transparent text-zinc-300"
          >
            Anterior
          </Button>
          <span className="text-xs text-zinc-500">
            Página {employeesQuery.data.current_page} de{" "}
            {employeesQuery.data.total_pages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || !employeesQuery.data.next}
            onClick={() => setPage((current) => current + 1)}
            className="border-white/10 bg-transparent text-zinc-300"
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
