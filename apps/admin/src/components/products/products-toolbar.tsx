"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type ProductsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function ProductsToolbar({
  search,
  onSearchChange,
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Buscar productos..."
          className="h-11 border-white/10 bg-zinc-950/60 pl-10 text-white placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}