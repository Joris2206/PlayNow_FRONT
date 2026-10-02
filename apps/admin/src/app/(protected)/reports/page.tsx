"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import {
  DebtsReport,
  InventoryReport,
  MonthlyReport,
  PaymentsReport,
} from "@/components/reports/report-panels";
import { getFinancialReadErrorMessage } from "@/components/reports/report-format";
import DateRangeFilter from "@/components/shared/date-range-filter";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDebtSummary,
  useInventorySummary,
  useMonthlySummary,
  usePaymentSummary,
} from "@/hooks/use-reports";
import {
  getCurrentMonthSelection,
  getPresetDateRange,
  type DateRangePreset,
  type FinancialDateRange,
} from "@/lib/financial-date";
import { hasAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type ReportTab = "monthly" | "payments" | "debts" | "inventory";

const FINANCIAL_TABS: Array<{ id: ReportTab; label: string }> = [
  { id: "monthly", label: "Resumen mensual" },
  { id: "payments", label: "Pagos" },
  { id: "debts", label: "Deudas" },
];

function QueryState({ loading, error, onRetry }: {
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (loading) return <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><div className="flex flex-col items-center gap-4"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /><p className="text-sm text-zinc-500">Cargando reporte...</p></div></div>;
  if (!error) return null;
  return <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h2 className="mt-4 font-medium text-white">No pudimos cargar el reporte</h2><p className="mt-2 text-sm text-zinc-400">{getFinancialReadErrorMessage(error, "No fue posible cargar el reporte.")}</p><Button type="button" variant="outline" onClick={onRetry} className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5">Reintentar</Button></div>;
}

export default function ReportsPage() {
  const { activeMembership, isLoading: isAuthLoading } = useAuth();
  const businessPublicId = activeMembership?.business_public_id;
  const canEnter = hasAccess(activeMembership?.role, "reports");
  const canViewFinancial = hasAccess(activeMembership?.role, "reports-financial");
  const canViewInventory = hasAccess(activeMembership?.role, "reports-inventory");
  const [activeTab, setActiveTab] = useState<ReportTab>("monthly");
  const [preset, setPreset] = useState<DateRangePreset>("month");
  const [range, setRange] = useState<FinancialDateRange>(() => getPresetDateRange("month"));
  const [monthSelection, setMonthSelection] = useState(() => getCurrentMonthSelection());

  useEffect(() => {
    setActiveTab(canViewFinancial ? "monthly" : "inventory");
    setPreset("month");
    setRange(getPresetDateRange("month"));
    setMonthSelection(getCurrentMonthSelection());
  }, [businessPublicId, canViewFinancial]);

  const rangeIsValid = Boolean(range.dateFrom && range.dateTo && range.dateFrom <= range.dateTo);
  const monthIsValid = Number.isInteger(monthSelection.year) && monthSelection.year >= 2000 && monthSelection.year <= 2100 && Number.isInteger(monthSelection.month) && monthSelection.month >= 1 && monthSelection.month <= 12;
  const monthlyQuery = useMonthlySummary({ businessPublicId, ...monthSelection, enabled: canViewFinancial && activeTab === "monthly" && monthIsValid });
  const paymentsQuery = usePaymentSummary({ businessPublicId, dateFrom: range.dateFrom, dateTo: range.dateTo, enabled: canViewFinancial && activeTab === "payments" && rangeIsValid });
  const debtsQuery = useDebtSummary({ businessPublicId, dateFrom: range.dateFrom, dateTo: range.dateTo, enabled: canViewFinancial && activeTab === "debts" && rangeIsValid });
  const inventoryQuery = useInventorySummary({ businessPublicId, dateFrom: range.dateFrom, dateTo: range.dateTo, enabled: canViewInventory && activeTab === "inventory" && rangeIsValid });

  if (!isAuthLoading && !canEnter) {
    return <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center"><div><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h1 className="mt-4 text-xl font-semibold text-white">Acceso no disponible</h1><p className="mt-2 text-sm text-zinc-400">Tu rol no tiene permiso para consultar reportes.</p></div></div>;
  }

  const tabs = [...(canViewFinancial ? FINANCIAL_TABS : []), ...(canViewInventory ? [{ id: "inventory" as const, label: "Inventario" }] : [])];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader eyebrow="Análisis" title="Reportes" description="Consulta el rendimiento y los movimientos de tu negocio." />
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition", activeTab === tab.id ? "bg-red-500 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white")}>{tab.label}</button>)}
      </div>

      {activeTab === "monthly" ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
          <label className="text-sm text-zinc-400">Mes<select value={monthSelection.month} onChange={(event) => setMonthSelection((current) => ({ ...current, month: Number(event.target.value) }))} className="mt-2 h-9 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-red-500/50">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Intl.DateTimeFormat("es-NI", { month: "long" }).format(new Date(2024, index, 1))}</option>)}</select></label>
          <label className="text-sm text-zinc-400">Año<Input type="number" min={2000} max={2100} value={monthSelection.year} onChange={(event) => setMonthSelection((current) => ({ ...current, year: Number(event.target.value) }))} className="mt-2 border-white/10 bg-black/30 text-white" /></label>
        </div>
      ) : <DateRangeFilter preset={preset} value={range} onPresetChange={(nextPreset, nextRange) => { setPreset(nextPreset); setRange(nextRange); }} onChange={setRange} />}

      {activeTab === "monthly" && !monthIsValid && <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">Selecciona un año entre 2000 y 2100.</p>}
      {activeTab === "monthly" && monthIsValid && <><QueryState loading={isAuthLoading || monthlyQuery.isLoading} error={monthlyQuery.error} onRetry={() => void monthlyQuery.refetch()} />{monthlyQuery.data && <MonthlyReport data={monthlyQuery.data} />}</>}
      {activeTab === "payments" && <><QueryState loading={isAuthLoading || paymentsQuery.isLoading} error={paymentsQuery.error} onRetry={() => void paymentsQuery.refetch()} />{paymentsQuery.data && <PaymentsReport data={paymentsQuery.data} />}</>}
      {activeTab === "debts" && <><QueryState loading={isAuthLoading || debtsQuery.isLoading} error={debtsQuery.error} onRetry={() => void debtsQuery.refetch()} />{debtsQuery.data && <DebtsReport data={debtsQuery.data} />}</>}
      {activeTab === "inventory" && <><QueryState loading={isAuthLoading || inventoryQuery.isLoading} error={inventoryQuery.error} onRetry={() => void inventoryQuery.refetch()} />{inventoryQuery.data && <InventoryReport data={inventoryQuery.data} />}</>}
    </div>
  );
}
