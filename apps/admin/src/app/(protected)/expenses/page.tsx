"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { useTransactions } from "@/hooks/use-transactions";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";

import CreateExpenseDialog from "@/components/expenses/create-expense-dialog";
import { getExpenseErrorMessage } from "@/components/expenses/expenses-format";
import ExpensesTable from "@/components/expenses/expenses-table";
import ExpensesToolbar from "@/components/expenses/expenses-toolbar";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const DEFAULT_PAGE_SIZE = 20;

export default function ExpensesPage() {
  const { activeMembership, isLoading: isAuthLoading } = useAuth();
  const businessPublicId = activeMembership?.business_public_id;
  const canRead = hasAccess(activeMembership?.role, "expenses");
  const canCreate = hasAccess(
    activeMembership?.role,
    "expenses-create"
  );
  const canCancel = hasAccess(
    activeMembership?.role,
    "expenses-cancel"
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchInput("");
    setSearch("");
    setCreateOpen(false);
  }, [businessPublicId]);

  const scopedBusinessPublicId =
    canRead && !isAuthLoading ? businessPublicId : undefined;
  const transactionsQuery = useTransactions({
    businessPublicId: scopedBusinessPublicId,
    type: "expense",
    page,
    pageSize,
    search,
    ordering: "-created_at",
  });
  const data = transactionsQuery.data;

  if (!isAuthLoading && !canRead) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Acceso no disponible
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tu rol no tiene permiso para consultar los gastos del negocio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Gastos"
        description="Registra y consulta los gastos de tu negocio."
      />

      <ExpensesToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        canCreate={Boolean(businessPublicId && canCreate)}
        onCreate={() => setCreateOpen(true)}
      />

      {(isAuthLoading || transactionsQuery.isLoading) && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">Cargando gastos...</p>
          </div>
        </div>
      )}

      {transactionsQuery.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
            <h3 className="mt-4 font-medium text-white">
              No pudimos cargar los gastos
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {getExpenseErrorMessage(
                transactionsQuery.error,
                "No fue posible cargar los gastos."
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => transactionsQuery.refetch()}
              className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {transactionsQuery.isSuccess && data && (
        <>
          <ExpensesTable
            transactions={data.results}
            businessPublicId={businessPublicId}
            canCancel={canCancel}
          />
          <ListPagination
            count={data.count}
            singularLabel="gasto"
            pluralLabel="gastos"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        </>
      )}

      <CreateExpenseDialog
        businessPublicId={businessPublicId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => setPage(1)}
      />
    </div>
  );
}
