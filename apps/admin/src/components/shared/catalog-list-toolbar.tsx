"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CatalogListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  pageSizeLabel: string;
  actions: ReactNode;
};

export default function CatalogListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  pageSize,
  onPageSizeChange,
  pageSizeLabel,
  actions,
}: CatalogListToolbarProps) {
  return (
    <div className="sticky top-20 z-20 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <Input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="h-11 border-white/10 bg-black/30 pl-10 text-white placeholder:text-zinc-600"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-none">
          <label className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-zinc-400">
            <span className="whitespace-nowrap">
              Por página
            </span>

            <select
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange(
                  Number(event.target.value)
                )
              }
              aria-label={pageSizeLabel}
              className="bg-transparent font-medium text-white outline-none"
            >
              <option value={10} className="bg-zinc-950">
                10
              </option>
              <option value={20} className="bg-zinc-950">
                20
              </option>
              <option value={50} className="bg-zinc-950">
                50
              </option>
            </select>
          </label>

          {actions}
        </div>
      </div>
    </div>
  );
}
