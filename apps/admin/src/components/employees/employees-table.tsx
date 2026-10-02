"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
  UserRoundCog,
} from "lucide-react";

import { useUpdateEmployee } from "@/hooks/use-employees";
import {
  findStatusByName,
  getCatalogStatusClassName,
  isActiveCatalogStatus,
  isRecoverableProductStatus,
  isTerminalCatalogStatus,
} from "@/lib/catalog-status";
import { cn } from "@/lib/utils";

import DeleteEmployeeDialog from "@/components/employees/delete-employee-dialog";
import EditEmployeeDialog from "@/components/employees/edit-employee-dialog";
import { getEmployeeErrorMessage } from "@/components/employees/employees-format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Employee } from "@/types/employee";
import type { EntityStatus } from "@/types/entity-status";

type Props = {
  employees: Employee[];
  businessPublicId?: string;
  canManage: boolean;
  statuses: EntityStatus[];
  statusesLoading: boolean;
  statusesError: boolean;
};

export default function EmployeesTable({
  employees,
  businessPublicId,
  canManage,
  statuses,
  statusesLoading,
  statusesError,
}: Props) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [statusEmployee, setStatusEmployee] = useState<Employee | null>(null);
  const updateEmployee = useUpdateEmployee();
  const activeStatus = findStatusByName(statuses, "Activo");
  const inactiveStatus = findStatusByName(statuses, "Inactivo");
  const missingRequiredStatuses =
    canManage &&
    !statusesLoading &&
    !statusesError &&
    (!activeStatus || !inactiveStatus);

  async function handleStatusChange(
    employee: Employee,
    statusPublicId: string
  ) {
    if (!businessPublicId || updateEmployee.isPending) return;
    setStatusEmployee(employee);

    try {
      await updateEmployee.mutateAsync({
        publicId: employee.public_id,
        businessPublicId,
        data: { status_public_id: statusPublicId },
      });
      setStatusEmployee(null);
    } catch {
      // React Query exposes the request error above the table.
    }
  }

  if (employees.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <UserRoundCog className="h-6 w-6" />
        </div>
        <h3 className="font-medium text-white">No hay empleados</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos empleados que coincidan con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <>
      {canManage && statusesError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          No fue posible cargar las acciones de estado. Intenta nuevamente.
        </div>
      )}

      {missingRequiredStatuses && (
        <div role="alert" className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          No están disponibles los estados Activo e Inactivo necesarios para cambiar el estado.
        </div>
      )}

      {updateEmployee.isPending && statusEmployee && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300" aria-live="polite">
          Actualizando el estado de {statusEmployee.full_name}...
        </div>
      )}

      {updateEmployee.isError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {getEmployeeErrorMessage(
            updateEmployee.error,
            "No fue posible actualizar el estado del empleado."
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table stickyHeader className="min-w-[980px]">
            <TableHeader className="border-b border-white/10 bg-white/[0.02]">
              <TableRow className="border-white/10 text-xs uppercase tracking-wider hover:bg-transparent">
                {[
                  "Nombre",
                  "Puesto",
                  "Teléfono",
                  "Correo",
                  "Estado",
                ].map((label) => (
                  <TableHead key={label} className="h-auto px-5 py-4 font-medium text-zinc-500">{label}</TableHead>
                ))}
                <TableHead className="h-auto w-24 px-5 py-4 text-right font-medium text-zinc-500">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {employees.map((employee) => {
                const isActive = isActiveCatalogStatus(employee.status_name);
                const isRecoverable = isRecoverableProductStatus(employee.status_name);
                const isTerminal = isTerminalCatalogStatus(employee.status_name);
                const targetStatus = isActive
                  ? inactiveStatus
                  : isRecoverable
                    ? activeStatus
                    : undefined;
                const statusActionLabel = isActive
                  ? "Desactivar empleado"
                  : isRecoverable
                    ? "Reactivar empleado"
                    : null;
                const isStatusActionPending =
                  updateEmployee.isPending &&
                  statusEmployee?.public_id === employee.public_id;

                return (
                  <TableRow key={employee.public_id} className="border-white/10 hover:bg-white/[0.025]">
                    <TableCell className="px-5 py-4 font-medium text-white">{employee.full_name}</TableCell>
                    <TableCell className="px-5 py-4 text-zinc-300">{employee.position}</TableCell>
                    <TableCell className="px-5 py-4 text-zinc-400">{employee.phone || "—"}</TableCell>
                    <TableCell className="max-w-64 truncate px-5 py-4 text-zinc-400">{employee.email || "—"}</TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getCatalogStatusClassName(employee.status_name))}>
                        {employee.status_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      {canManage ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" disabled={isStatusActionPending} aria-label={`Abrir acciones de ${employee.full_name}`} className="text-zinc-500 hover:bg-white/5 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 border-white/10 bg-zinc-950 text-zinc-300">
                            <DropdownMenuLabel className="truncate text-xs text-zinc-500">{employee.full_name}</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => setEditingEmployee(employee)}>
                              <Pencil />Editar empleado
                            </DropdownMenuItem>
                            {statusActionLabel && (
                              <DropdownMenuItem
                                disabled={!targetStatus || updateEmployee.isPending || statusesLoading || statusesError}
                                onSelect={() => {
                                  if (targetStatus) void handleStatusChange(employee, targetStatus.public_id);
                                }}
                              >
                                {isActive ? <Power /> : <RotateCcw />}
                                {statusesLoading
                                  ? "Cargando estados..."
                                  : targetStatus
                                    ? statusActionLabel
                                    : `${statusActionLabel} no disponible`}
                              </DropdownMenuItem>
                            )}
                            {!isTerminal && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" disabled={updateEmployee.isPending} onSelect={() => setDeletingEmployee(employee)}>
                                  <Trash2 />Eliminar empleado
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditEmployeeDialog employee={editingEmployee} businessPublicId={businessPublicId} open={Boolean(editingEmployee)} onOpenChange={(open) => { if (!open) setEditingEmployee(null); }} />
      <DeleteEmployeeDialog employee={deletingEmployee} businessPublicId={businessPublicId} open={Boolean(deletingEmployee)} onOpenChange={(open) => { if (!open) setDeletingEmployee(null); }} />
    </>
  );
}
