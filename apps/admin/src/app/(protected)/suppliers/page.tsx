"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { useSuppliers } from "@/hooks/use-suppliers";
import { hasAccess } from "@/lib/permissions";
import { useAuth } from "@/providers/auth-provider";
import CreateSupplierDialog from "@/components/suppliers/create-supplier-dialog";
import SuppliersTable from "@/components/suppliers/suppliers-table";
import SuppliersToolbar from "@/components/suppliers/suppliers-toolbar";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const DEFAULT_PAGE_SIZE = 20;

export default function SuppliersPage() {
  const { activeMembership } = useAuth();
  const businessPublicId = activeMembership?.business_public_id;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { const timeout = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 400); return () => clearTimeout(timeout); }, [searchInput]);
  useEffect(() => { setPage(1); setSearchInput(""); setSearch(""); setCreateOpen(false); }, [businessPublicId]);

  const suppliersQuery = useSuppliers({ businessPublicId, page, pageSize, search, ordering: "-created_at" });
  const data = suppliersQuery.data;
  const canCreate = Boolean(businessPublicId && hasAccess(activeMembership?.role, "suppliers-create"));

  return <div className="mx-auto max-w-7xl space-y-6">
    <PageHeader eyebrow="Proveedores" title="Suppliers" description="Consulta y registra los proveedores de tu negocio." />
    <SuppliersToolbar search={searchInput} onSearchChange={setSearchInput} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1); }} onCreate={() => setCreateOpen(true)} canCreate={canCreate} />
    {suppliersQuery.isLoading && <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]"><div className="flex flex-col items-center gap-4"><LoaderCircle className="h-7 w-7 animate-spin text-red-500" /><p className="text-sm text-zinc-500">Cargando proveedores...</p></div></div>}
    {suppliersQuery.isError && <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6"><div className="text-center"><AlertCircle className="mx-auto h-7 w-7 text-red-400" /><h3 className="mt-4 font-medium text-white">No pudimos cargar los proveedores</h3><p className="mt-2 text-sm text-zinc-500">Verifica tu conexión e intenta nuevamente.</p><Button type="button" variant="outline" onClick={() => suppliersQuery.refetch()} className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5">Reintentar</Button></div></div>}
    {suppliersQuery.isSuccess && data && <><SuppliersTable suppliers={data.results} /><ListPagination count={data.count} singularLabel="proveedor" pluralLabel="proveedores" currentPage={data.current_page} totalPages={data.total_pages} hasPrevious={Boolean(data.previous)} hasNext={Boolean(data.next)} onPageChange={setPage} /></>}
    <CreateSupplierDialog businessPublicId={businessPublicId} open={createOpen} onOpenChange={setCreateOpen} onCreated={() => setPage(1)} />
  </div>;
}
