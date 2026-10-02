"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import CommissionEmployeeSelect from "@/components/commissions/commission-employee-select";
import CreateCommissionSettlementDialog from "@/components/commissions/create-commission-settlement-dialog";
import {
  formatCommissionDate,
  formatCommissionMoney,
  getCommissionErrorMessage,
} from "@/components/commissions/commissions-format";
import DateRangeFilter from "@/components/shared/date-range-filter";
import { Button } from "@/components/ui/button";
import { useCommissionPreview } from "@/hooks/use-commission-preview";
import {
  getPresetDateRange,
  type DateRangePreset,
  type FinancialDateRange,
} from "@/lib/financial-date";
import type { CommissionSettlement } from "@/types/commission";
import type { EmployeeOption } from "@/types/employee";

type Props = {
  businessPublicId?: string;
  onSettlementCreated: (settlement: CommissionSettlement) => void;
};

export default function CommissionPreviewSection({
  businessPublicId,
  onSettlementCreated,
}: Props) {
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [preset, setPreset] = useState<DateRangePreset>("month");
  const [range, setRange] = useState<FinancialDateRange>(() =>
    getPresetDateRange("month")
  );
  const [submitted, setSubmitted] = useState<{
    employeePublicId: string;
    dateFrom: string;
    dateTo: string;
  } | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setEmployeePublicId("");
    setSelectedEmployee(null);
    setPreset("month");
    setRange(getPresetDateRange("month"));
    setSubmitted(null);
    setAttemptedSubmit(false);
    setCreateOpen(false);
  }, [businessPublicId]);

  const validPeriod = Boolean(
    range.dateFrom && range.dateTo && range.dateFrom <= range.dateTo
  );
  const previewQuery = useCommissionPreview({
    businessPublicId,
    employeePublicId: submitted?.employeePublicId,
    dateFrom: submitted?.dateFrom ?? "",
    dateTo: submitted?.dateTo ?? "",
    enabled: Boolean(submitted),
  });

  function clearCurrentResult() {
    setSubmitted(null);
    setCreateOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!employeePublicId || !validPeriod) return;
    setSubmitted({
      employeePublicId,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    });
  }

  const preview = previewQuery.data;
  const currency = preview?.business.currency ?? "";
  const metrics = preview
    ? [
        ["Ventas", `${preview.sales_count}`],
        ["Total vendido", formatCommissionMoney(preview.sales_total, currency)],
        ["Porcentaje", `${preview.commission_percentage}%`],
        ["Comisión bruta", formatCommissionMoney(preview.commission_total, currency)],
        ["Adelantos", formatCommissionMoney(preview.employee_advances, currency)],
        ["Reintegros", formatCommissionMoney(preview.employee_repayments, currency)],
        ["Balance de adelantos", formatCommissionMoney(preview.advance_balance, currency)],
        ["Neto pagable", formatCommissionMoney(preview.net_commission_payable, currency)],
        ["Balance restante", formatCommissionMoney(preview.remaining_advance_balance, currency)],
      ]
    : [];

  return (
    <section className="space-y-5" aria-labelledby="commission-preview-heading">
      <div><h2 id="commission-preview-heading" className="text-lg font-semibold text-white">Vista previa</h2><p className="mt-1 text-sm text-zinc-500">Consulta la comisión estimada para un empleado y período.</p></div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <CommissionEmployeeSelect id="commission-preview-employee" label="Empleado activo" businessPublicId={businessPublicId} value={employeePublicId} selectedEmployee={selectedEmployee} activeOnly required invalid={attemptedSubmit && !employeePublicId} onChange={(value, employee) => { setEmployeePublicId(value); setSelectedEmployee(employee); clearCurrentResult(); }} />
        {attemptedSubmit && !employeePublicId && <p className="text-xs text-red-400">Selecciona un empleado.</p>}
        <DateRangeFilter preset={preset} value={range} onPresetChange={(nextPreset, nextRange) => { setPreset(nextPreset); setRange(nextRange); clearCurrentResult(); }} onChange={(nextRange) => { setRange(nextRange); clearCurrentResult(); }} />
        <div className="flex justify-end"><Button type="submit" disabled={!businessPublicId || !employeePublicId || !validPeriod || previewQuery.isFetching} className="bg-red-500 text-white hover:bg-red-600">{previewQuery.isFetching ? <><LoaderCircle className="h-4 w-4 animate-spin" />Consultando...</> : "Consultar preview"}</Button></div>
      </form>
      {previewQuery.isError && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><p className="mt-3 text-sm text-red-300">{getCommissionErrorMessage(previewQuery.error, "No fue posible calcular la vista previa.")}</p><Button type="button" variant="outline" onClick={() => previewQuery.refetch()} className="mt-4 border-white/10 bg-transparent text-white">Reintentar</Button></div>}
      {preview && submitted && <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm text-zinc-500">{preview.employee.full_name}</p><h3 className="mt-1 font-semibold text-white">{formatCommissionDate(preview.period.date_from)} – {formatCommissionDate(preview.period.date_to)}</h3></div><Button type="button" onClick={() => setCreateOpen(true)} className="bg-red-500 text-white hover:bg-red-600">Crear liquidación</Button></div><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4"><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-2 text-base font-medium text-white">{value}</dd></div>)}</dl></div>}
      <CreateCommissionSettlementDialog businessPublicId={businessPublicId} preview={preview ?? null} open={createOpen} onOpenChange={setCreateOpen} onCreated={onSettlementCreated} />
    </section>
  );
}
