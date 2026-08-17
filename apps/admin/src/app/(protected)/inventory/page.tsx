"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useProducts } from "@/hooks/use-products";
import { useAuth } from "@/providers/auth-provider";

import InventoryTable from "@/components/inventory/inventory-table";
import InventoryToolbar, {
  type InventoryOrdering,
} from "@/components/inventory/inventory-toolbar";
import StockMovementDialog from "@/components/inventory/stock-movement-dialog";
import ListPagination from "@/components/shared/list-pagination";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

import type { Product } from "@/types/product";

const DEFAULT_PAGE_SIZE = 20;

export default function InventoryPage() {
  const { activeMembership } = useAuth();
  const businessPublicId =
    activeMembership?.business_public_id;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    DEFAULT_PAGE_SIZE
  );
  const [ordering, setOrdering] =
    useState<InventoryOrdering>("title");
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] = useState("");
  const [historyProduct, setHistoryProduct] =
    useState<Product | null>(null);

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
    ordering,
  });

  const data = productsQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Inventario"
        title="Existencias"
        description="Consulta el stock actual y los movimientos registrados para los productos de tu negocio."
      />

      <InventoryToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        pageSize={pageSize}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        ordering={ordering}
        onOrderingChange={(nextOrdering) => {
          setOrdering(nextOrdering);
          setPage(1);
        }}
      />

      {productsQuery.isLoading && (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">
              Cargando inventario...
            </p>
          </div>
        </div>
      )}

      {productsQuery.isError && (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
            <h3 className="mt-4 font-medium text-white">
              No pudimos cargar el inventario
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Verifica tu conexión e intenta nuevamente.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => productsQuery.refetch()}
              className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {productsQuery.isSuccess && data && (
        <>
          <InventoryTable
            products={data.results}
            onViewMovements={setHistoryProduct}
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

      <StockMovementDialog
        businessPublicId={businessPublicId}
        product={historyProduct}
        open={Boolean(historyProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setHistoryProduct(null);
          }
        }}
      />
    </div>
  );
}
