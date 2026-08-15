"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useProducts } from "@/hooks/use-products";

import PageHeader from "@/components/shared/page-header";
import CreateProductDialog from "@/components/products/create-product-dialog";
import ProductsToolbar from "@/components/products/products-toolbar";
import ProductsTable from "@/components/products/products-table";
import ListPagination from "@/components/shared/list-pagination";

import { Button } from "@/components/ui/button";

const DEFAULT_PAGE_SIZE = 20;

export default function ProductsPage() {
  const { activeMembership } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    DEFAULT_PAGE_SIZE
  );
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);

  const businessPublicId =
    activeMembership?.business_public_id;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const productsQuery = useProducts({
    businessPublicId,

    page,
    pageSize,
    search,
  });

  const data = productsQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Administra los productos disponibles en tu negocio."
      />

      <ProductsToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        pageSize={pageSize}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        onCreate={() => setCreateDialogOpen(true)}
        canCreate={Boolean(businessPublicId)}
      />

      {productsQuery.isLoading && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />

            <p className="text-sm text-zinc-500">
              Cargando productos...
            </p>
          </div>
        </div>
      )}

      {productsQuery.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />

            <h3 className="mt-4 font-medium text-white">
              No pudimos cargar los productos
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Verifica tu conexión e intenta nuevamente.
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                productsQuery.refetch()
              }
              className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {productsQuery.isSuccess && data && (
        <>
          <ProductsTable
            products={data.results}
          />

          <ListPagination
            count={data.count}
            singularLabel="producto"
            pluralLabel="productos"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        </>
      )}

      <CreateProductDialog
        businessPublicId={businessPublicId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => setPage(1)}
      />
    </div>
  );
}
