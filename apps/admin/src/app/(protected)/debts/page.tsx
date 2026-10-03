"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { HttpError } from "@/lib/http";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import DebtDetailDialog from "@/components/debts/debt-detail-dialog";
import RegisterDebtPaymentDialog from "@/components/debts/register-debt-payment-dialog";
import DebtsTable from "@/components/debts/debts-table";
import DebtsToolbar, { DEBT_TAB_IDS, type DebtSettlementFilter } from "@/components/debts/debts-toolbar";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { Debt } from "@/types/debt";

const DEFAULT_PAGE_SIZE = 20;

function listErrorMessage(error: unknown) {
  if (!(error instanceof HttpError)) return "No fue posible cargar las cuentas.";
  if (error.status === 400) return "El negocio o alguno de los filtros no es válido.";
  if (error.status === 403) return "No tienes permisos para consultar las cuentas del negocio.";
  return error.message;
}

export default function DebtsPage() {
  const { activeMembership, isLoading: isAuthLoading } = useAuth();
  const businessPublicId = activeMembership?.business_public_id;
  const canReadDebts = hasAccess(activeMembership?.role, "debts");
  const canPayDebts = hasAccess(activeMembership?.role, "debts-pay");
  const [transactionType, setTransactionType] = useState<"sale" | "purchase">("sale");
  const [settlement, setSettlement] = useState<DebtSettlementFilter>("open");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  useEffect(() => {
    setTransactionType("sale");
    setSettlement("open");
    setPage(1);
    setSelectedDebt(null);
    setPaymentDebt(null);
  }, [businessPublicId]);

  const debtsQuery = useDebts({
    businessPublicId: canReadDebts ? businessPublicId : undefined,
    transactionType,
    isSettled: settlement === "all" ? undefined : settlement === "settled",
    page,
    pageSize,
    ordering: "-created_at",
  });
  const data = debtsQuery.data;

  if (!isAuthLoading && !canReadDebts) return <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center"><div><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h1 className="mt-4 text-xl font-semibold text-white">Acceso no disponible</h1><p className="mt-2 text-sm text-zinc-400">Tu rol no tiene permiso para consultar cuentas por cobrar o por pagar.</p></div></div>;

  return <div className="mx-auto max-w-7xl space-y-6"><PageHeader eyebrow="Finanzas" title="Deudas" description={transactionType === "sale" ? "Consulta las cuentas por cobrar: importes que clientes deben al negocio." : "Consulta las cuentas por pagar: importes que el negocio debe a proveedores."} />
    <DebtsToolbar transactionType={transactionType} settlement={settlement} pageSize={pageSize} onTransactionTypeChange={(value) => { setTransactionType(value); setPage(1); setSelectedDebt(null); setPaymentDebt(null); }} onSettlementChange={(value) => { setSettlement(value); setPage(1); setPaymentDebt(null); }} onPageSizeChange={(value) => { setPageSize(value); setPage(1); }} />
    <div
      id={DEBT_TAB_IDS[transactionType].panel}
      role="tabpanel"
      aria-labelledby={DEBT_TAB_IDS[transactionType].tab}
      tabIndex={0}
      className="space-y-6 outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
    >
      {(isAuthLoading || debtsQuery.isLoading) && <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><div className="flex flex-col items-center gap-4"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /><p className="text-sm text-zinc-500">Cargando cuentas...</p></div></div>}
      {debtsQuery.isError && <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6"><div className="text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h3 className="mt-4 font-medium text-white">No pudimos cargar las cuentas</h3><p className="mt-2 text-sm text-zinc-400">{listErrorMessage(debtsQuery.error)}</p><Button type="button" variant="outline" onClick={() => debtsQuery.refetch()} className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5">Reintentar</Button></div></div>}
      {debtsQuery.isSuccess && data && <><DebtsTable debts={data.results} transactionType={transactionType} canPay={canPayDebts} onView={setSelectedDebt} onPay={setPaymentDebt} /><ListPagination count={data.count} singularLabel="cuenta" pluralLabel="cuentas" currentPage={data.current_page} totalPages={data.total_pages} hasPrevious={Boolean(data.previous)} hasNext={Boolean(data.next)} onPageChange={setPage} /></>}
    </div>
    <DebtDetailDialog debt={selectedDebt} businessPublicId={businessPublicId} open={Boolean(selectedDebt)} onOpenChange={(open) => { if (!open) setSelectedDebt(null); }} />
    <RegisterDebtPaymentDialog debt={paymentDebt} businessPublicId={businessPublicId} open={Boolean(paymentDebt)} onOpenChange={(open) => { if (!open) setPaymentDebt(null); }} />
  </div>;
}
