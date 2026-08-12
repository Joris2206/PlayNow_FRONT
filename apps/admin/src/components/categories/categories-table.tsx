"use client";

import { Tags } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Category } from "@/types/category";

type CategoriesTableProps = {
  categories: Category[];
};

export default function CategoriesTable({
  categories,
}: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
          <Tags className="h-6 w-6" />
        </div>

        <h3 className="font-medium text-white">
          No hay categorías
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No encontramos categorías que coincidan con la búsqueda actual.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <Table className="min-w-[600px]">
        <TableHeader className="border-b border-white/10 bg-white/[0.02]">
          <TableRow className="border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500 hover:bg-transparent">
            <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
              Categoría
            </TableHead>

            <TableHead className="h-auto px-5 py-4 font-medium text-zinc-500">
              Estado
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.public_id}
              className="border-white/10 hover:bg-white/[0.025]"
            >
              <TableCell className="px-5 py-4 font-medium text-white">
                {category.name}
              </TableCell>

              <TableCell className="px-5 py-4">
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
                  {category.status_name}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
