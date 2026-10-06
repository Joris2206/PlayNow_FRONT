"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, LoaderCircle, Search } from "lucide-react";

import { useBusinesses } from "@/hooks/use-businesses";
import { useAuth } from "@/providers/auth-provider";

import ListPagination from "@/components/shared/list-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;
const ORDERING = "business_name";

const ROLE_LABELS = {
  owner: "Propietario",
  admin: "Administrador",
  cashier: "Cajero",
  seller: "Vendedor",
  inventory: "Inventario",
  viewer: "Consulta",
} as const;

export default function PlatformBusinessSelector({
  onSelected,
}: {
  onSelected?: () => void;
}) {
  const {
    activeBusinessPublicId,
    isPlatformAdmin,
    memberships,
    selectBusiness,
  } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = useBusinesses({
    enabled: isPlatformAdmin,
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    ordering: ORDERING,
  });
  const membershipByBusiness = useMemo(
    () =>
      new Map(
        memberships.map((membership) => [
          membership.business_public_id,
          membership,
        ])
      ),
    [memberships]
  );
  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar negocio..."
          aria-label="Buscar negocios"
          className="border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-zinc-600"
        />
      </div>

      {query.isLoading && (
        <div className="flex min-h-48 items-center justify-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-red-500" />
        </div>
      )}

      {query.isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
          <p className="mt-3 text-sm text-red-300">
            No pudimos cargar los negocios globales. La selección actual no fue modificada.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => query.refetch()}
            className="mt-4 border-white/10 bg-transparent text-white"
          >
            Reintentar
          </Button>
        </div>
      )}

      {query.isSuccess && data && data.results.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <Building2 className="mx-auto h-7 w-7 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">
            {search
              ? "No encontramos negocios para esta búsqueda."
              : "No hay negocios disponibles en la plataforma."}
          </p>
        </div>
      )}

      {query.isSuccess && data && data.results.length > 0 && (
        <>
          <div
            className="max-h-[44vh] space-y-2 overflow-y-auto pr-1"
            role="list"
            aria-label="Negocios de la plataforma"
          >
            {data.results.map((business) => {
              const membership = membershipByBusiness.get(
                business.public_id
              );
              const selected =
                business.public_id === activeBusinessPublicId;

              return (
                <Button
                  key={business.public_id}
                  type="button"
                  variant="ghost"
                  role="listitem"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => {
                    if (selectBusiness(business)) onSelected?.();
                  }}
                  className="h-auto w-full justify-start border border-white/10 bg-white/[0.02] px-4 py-3 text-left hover:bg-white/[0.07]"
                >
                  <span className="min-w-0">
                    <span
                      className="block truncate font-medium text-white"
                      title={business.business_name}
                    >
                      {business.business_name}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {membership
                        ? ROLE_LABELS[membership.role]
                        : "Administrador de plataforma"}
                      {selected ? " · Activo" : ""}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>

          <ListPagination
            count={data.count}
            singularLabel="negocio"
            pluralLabel="negocios"
            currentPage={data.current_page}
            totalPages={data.total_pages}
            hasPrevious={Boolean(data.previous)}
            hasNext={Boolean(data.next)}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
