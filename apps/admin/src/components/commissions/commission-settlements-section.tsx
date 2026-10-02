"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import CommissionSettlementDetailDialog from "@/components/commissions/commission-settlement-detail-dialog";
import CommissionSettlementsTable from "@/components/commissions/commission-settlements-table";
import CommissionSettlementsToolbar from "@/components/commissions/commission-settlements-toolbar";
import MarkCommissionSettlementPaidDialog from "@/components/commissions/mark-commission-settlement-paid-dialog";
import { getCommissionErrorMessage } from "@/components/commissions/commissions-format";
import ListPagination from "@/components/shared/list-pagination";
import { Button } from "@/components/ui/button";
import { useCommissionSettlements } from "@/hooks/use-commission-settlements";
import type { CommissionSettlement, CommissionSettlementOrdering, CommissionSettlementStatus } from "@/types/commission";
import type { EmployeeOption } from "@/types/employee";

type Props = { businessPublicId?: string; notice?: string; onNoticeDismiss: () => void };

export default function CommissionSettlementsSection({ businessPublicId, notice, onNoticeDismiss }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [status, setStatus] = useState<CommissionSettlementStatus | "">("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [ordering, setOrdering] = useState<CommissionSettlementOrdering>("-period_end,-created_at");
  const [selectedSettlement, setSelectedSettlement] = useState<CommissionSettlement | null>(null);
  const [payingSettlement, setPayingSettlement] = useState<CommissionSettlement | null>(null);
  const [paidMessage, setPaidMessage] = useState("");

  useEffect(() => {
    setPage(1); setPageSize(20); setEmployeePublicId(""); setSelectedEmployee(null); setStatus(""); setPeriodStart(""); setPeriodEnd(""); setOrdering("-period_end,-created_at"); setSelectedSettlement(null); setPayingSettlement(null); setPaidMessage("");
  }, [businessPublicId]);

  const query = useCommissionSettlements({ businessPublicId, employeePublicId: employeePublicId || undefined, status: status || undefined, periodStart: periodStart || undefined, periodEnd: periodEnd || undefined, ordering, page, pageSize });
  const changeFilter = (change: () => void) => { change(); setPage(1); };

  return <section className="space-y-5" aria-labelledby="commission-settlements-heading"><div><h2 id="commission-settlements-heading" className="text-lg font-semibold text-white">Liquidaciones</h2><p className="mt-1 text-sm text-zinc-500">Consulta las liquidaciones registradas y actualiza su pago.</p></div>{notice && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"><span>{notice}</span><Button type="button" variant="ghost" size="sm" onClick={onNoticeDismiss}>Cerrar</Button></div>}{paidMessage && <div role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{paidMessage}</div>}<CommissionSettlementsToolbar businessPublicId={businessPublicId} employeePublicId={employeePublicId} selectedEmployee={selectedEmployee} onEmployeeChange={(value, employee) => changeFilter(() => { setEmployeePublicId(value); setSelectedEmployee(employee); })} status={status} onStatusChange={(value) => changeFilter(() => setStatus(value))} periodStart={periodStart} onPeriodStartChange={(value) => changeFilter(() => setPeriodStart(value))} periodEnd={periodEnd} onPeriodEndChange={(value) => changeFilter(() => setPeriodEnd(value))} ordering={ordering} onOrderingChange={(value) => changeFilter(() => setOrdering(value))} pageSize={pageSize} onPageSizeChange={(value) => changeFilter(() => setPageSize(Math.min(value, 200)))} />{query.isLoading && <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /></div>}{query.isError && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><p className="mt-3 text-sm text-red-300">{getCommissionErrorMessage(query.error, "No fue posible cargar las liquidaciones.")}</p><Button type="button" variant="outline" onClick={() => query.refetch()} className="mt-4 border-white/10 bg-transparent text-white">Reintentar</Button></div>}{query.data && <><CommissionSettlementsTable settlements={query.data.results} onView={setSelectedSettlement} onMarkPaid={setPayingSettlement} /><ListPagination count={query.data.count} singularLabel="liquidación" pluralLabel="liquidaciones" currentPage={query.data.current_page} totalPages={query.data.total_pages} hasPrevious={Boolean(query.data.previous)} hasNext={Boolean(query.data.next)} onPageChange={setPage} /></>}<CommissionSettlementDetailDialog businessPublicId={businessPublicId} settlement={selectedSettlement} open={Boolean(selectedSettlement)} onOpenChange={(open) => { if (!open) setSelectedSettlement(null); }} onMarkPaid={setPayingSettlement} /><MarkCommissionSettlementPaidDialog businessPublicId={businessPublicId} settlement={payingSettlement} open={Boolean(payingSettlement)} onOpenChange={(open) => { if (!open) setPayingSettlement(null); }} onPaid={() => setPaidMessage("La liquidación fue marcada como pagada.")} /></section>;
}
