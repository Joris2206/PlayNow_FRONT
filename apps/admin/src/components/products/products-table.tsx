"use client";

import {
  MoreHorizontal,
  PackageSearch,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Product } from "@/types/product";

type ProductsTableProps = {
  products: Product[];
};

function formatMoney(value: string) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
  }).format(number);
}

export default function ProductsTable({
  products,
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <PackageSearch className="h-6 w-6" />
        </div>

        <h3 className="font-medium text-white">
          No hay productos
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos productos que coincidan con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-white/10 bg-white/[0.02]">
            <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-4 font-medium">
                Producto
              </th>

              <th className="px-5 py-4 font-medium">
                Categoría
              </th>

              <th className="px-5 py-4 font-medium">
                Precio
              </th>

              <th className="px-5 py-4 font-medium">
                Costo
              </th>

              <th className="px-5 py-4 font-medium">
                Stock
              </th>

              <th className="px-5 py-4 font-medium">
                Estado
              </th>

              <th className="w-16 px-5 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {products.map((product) => (
              <tr
                key={product.public_id}
                className="transition hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-white">
                      {product.title}
                    </p>

                    {product.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                        {product.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-zinc-400">
                  {product.category}
                </td>

                <td className="px-5 py-4 text-sm font-medium text-white">
                  {formatMoney(product.base_price)}
                </td>

                <td className="px-5 py-4 text-sm text-zinc-400">
                  {formatMoney(product.base_cost)}
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm text-zinc-300">
                    {product.stock}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    {product.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-zinc-500 hover:bg-white/5 hover:text-white"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}