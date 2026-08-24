"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import DashboardOverviewContent from "@/components/dashboard/dashboard-overview";
import { getFinancialReadErrorMessage } from "@/components/reports/report-format";
import DateRangeFilter from "@/components/shared/date-range-filter";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { getPresetDateRange, type DateRangePreset, type FinancialDateRange } from "@/lib/financial-date";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { activeMembership, isLoading: isAuthLoading } = useAuth();
  const businessPublicId = activeMembership?.business_public_id;
  const canView = hasAccess(activeMembership?.role, "dashboard");
  const [preset, setPreset] = useState<DateRangePreset>("month");
  const [range, setRange] = useState<FinancialDateRange>(() => getPresetDateRange("month"));

  useEffect(() => {
    setPreset("month");
    setRange(getPresetDateRange("month"));
  }, [businessPublicId]);

  const validRange = Boolean(range.dateFrom && range.dateTo && range.dateFrom <= range.dateTo);
  const overviewQuery = useDashboardOverview({
    businessPublicId,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    enabled: canView && !isAuthLoading && validRange,
  });

  if (!isAuthLoading && !canView) {
    return <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center"><div><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h1 className="mt-4 text-xl font-semibold text-white">Acceso no disponible</h1><p className="mt-2 text-sm text-zinc-400">Tu rol no tiene permiso para consultar el Dashboard.</p></div></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader eyebrow="Resumen general" title="Dashboard" description="Visión ejecutiva del período con métricas calculadas por PlayNow API." />
      <DateRangeFilter preset={preset} value={range} onPresetChange={(nextPreset, nextRange) => { setPreset(nextPreset); setRange(nextRange); }} onChange={setRange} />
      {(isAuthLoading || overviewQuery.isLoading) && validRange && <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><div className="flex flex-col items-center gap-4"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /><p className="text-sm text-zinc-500">Cargando resumen...</p></div></div>}
      {overviewQuery.isError && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h2 className="mt-4 font-medium text-white">No pudimos cargar el Dashboard</h2><p className="mt-2 text-sm text-zinc-400">{getFinancialReadErrorMessage(overviewQuery.error, "No fue posible cargar el resumen.")}</p><Button type="button" variant="outline" onClick={() => overviewQuery.refetch()} className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5">Reintentar</Button></div>}
      {overviewQuery.isSuccess && overviewQuery.data && <DashboardOverviewContent overview={overviewQuery.data} />}
    </div>
  );
}
