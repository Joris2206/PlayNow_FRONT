"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import CommissionPlanFormDialog from "@/components/commissions/commission-plan-form-dialog";
import CommissionPlansTable from "@/components/commissions/commission-plans-table";
import CommissionPlansToolbar from "@/components/commissions/commission-plans-toolbar";
import DeleteCommissionPlanDialog from "@/components/commissions/delete-commission-plan-dialog";
import { getCommissionErrorMessage } from "@/components/commissions/commissions-format";
import ListPagination from "@/components/shared/list-pagination";
import { Button } from "@/components/ui/button";
import { useCommissionPlans } from "@/hooks/use-commission-plans";
import type { CommissionPlan, CommissionPlanOrdering } from "@/types/commission";
import type { EmployeeOption } from "@/types/employee";

type Props = { businessPublicId?: string };

export default function CommissionPlansSection({ businessPublicId }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [ordering, setOrdering] = useState<CommissionPlanOrdering>("-valid_from");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CommissionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<CommissionPlan | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setPage(1);
    setPageSize(20);
    setEmployeePublicId("");
    setSelectedEmployee(null);
    setActiveFilter("all");
    setOrdering("-valid_from");
    setFormOpen(false);
    setEditingPlan(null);
    setDeletingPlan(null);
    setSuccessMessage("");
  }, [businessPublicId]);

  const query = useCommissionPlans({
    businessPublicId,
    employeePublicId: employeePublicId || undefined,
    isActive:
      activeFilter === "all" ? undefined : activeFilter === "active",
    ordering,
    page,
    pageSize,
  });

  return (
    <section className="space-y-5" aria-labelledby="commission-plans-heading">
      <div><h2 id="commission-plans-heading" className="text-lg font-semibold text-white">Planes de comisión</h2><p className="mt-1 text-sm text-zinc-500">Configura porcentajes por empleado y período de vigencia.</p></div>
      {successMessage && <div role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{successMessage}</div>}
      <CommissionPlansToolbar businessPublicId={businessPublicId} employeePublicId={employeePublicId} selectedEmployee={selectedEmployee} onEmployeeChange={(value, employee) => { setEmployeePublicId(value); setSelectedEmployee(employee); setPage(1); }} activeFilter={activeFilter} onActiveFilterChange={(value) => { setActiveFilter(value); setPage(1); }} ordering={ordering} onOrderingChange={(value) => { setOrdering(value); setPage(1); }} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1); }} onCreate={() => { setEditingPlan(null); setFormOpen(true); }} />
      {query.isLoading && <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /></div>}
      {query.isError && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><p className="mt-3 text-sm text-red-300">{getCommissionErrorMessage(query.error, "No fue posible cargar los planes.")}</p><Button type="button" variant="outline" onClick={() => query.refetch()} className="mt-4 border-white/10 bg-transparent text-white">Reintentar</Button></div>}
      {query.data && <><CommissionPlansTable plans={query.data.results} businessPublicId={businessPublicId} onEdit={(plan) => { setEditingPlan(plan); setFormOpen(true); }} onDelete={setDeletingPlan} /><ListPagination count={query.data.count} singularLabel="plan" pluralLabel="planes" currentPage={query.data.current_page} totalPages={query.data.total_pages} hasPrevious={Boolean(query.data.previous)} hasNext={Boolean(query.data.next)} onPageChange={setPage} /></>}
      <CommissionPlanFormDialog businessPublicId={businessPublicId} plan={editingPlan} open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingPlan(null); }} onSaved={(plan) => { setSuccessMessage(`Plan de ${plan.employee_name} guardado correctamente.`); setPage(1); }} />
      <DeleteCommissionPlanDialog businessPublicId={businessPublicId} plan={deletingPlan} open={Boolean(deletingPlan)} onOpenChange={(open) => { if (!open) setDeletingPlan(null); }} />
    </section>
  );
}
