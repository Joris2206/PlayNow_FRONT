"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  LoaderCircle,
  Plus,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useProducts } from "@/hooks/use-products";

import PageHeader from "@/components/shared/page-header";
import ProductsToolbar from "@/components/products/products-toolbar";
import ProductsTable from "@/components/products/products-table";

import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const { activeMembership } = useAuth();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const productsQuery = useProducts({
    businessPublicId:
      activeMembership?.business_public_id,

    page,
    pageSize: PAGE_SIZE,
    search,
  });

  const data = productsQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Administra los productos disponibles en tu negocio."
        actions={
          <Button
            type="button"
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        }
      />

      <ProductsToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
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

          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {data.count} producto
              {data.count === 1 ? "" : "s"} en total
            </p>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!data.previous}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="border-white/10 bg-transparent text-white hover:bg-white/5"
              >
                Anterior
              </Button>

              <span className="min-w-24 text-center text-sm text-zinc-400">
                Página {data.current_page} de{" "}
                {data.total_pages}
              </span>

              <Button
                type="button"
                variant="outline"
                disabled={!data.next}
                onClick={() =>
                  setPage((current) =>
                    current + 1
                  )
                }
                className="border-white/10 bg-transparent text-white hover:bg-white/5"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}