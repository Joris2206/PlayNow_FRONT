"use client";

import { Button } from "@/components/ui/button";

type ListPaginationProps = {
  count: number;
  singularLabel: string;
  pluralLabel: string;
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
};

const paginationButtonClassName =
  "border-white/10 bg-transparent text-zinc-300 hover:bg-transparent dark:hover:bg-transparent enabled:hover:border-white/20 enabled:hover:bg-white/10 enabled:hover:text-white dark:enabled:hover:bg-white/10 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.02] disabled:text-zinc-600 disabled:opacity-60 disabled:hover:bg-white/[0.02] disabled:hover:text-zinc-600 dark:disabled:hover:bg-white/[0.02]";

export default function ListPagination({
  count,
  singularLabel,
  pluralLabel,
  currentPage,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
}: ListPaginationProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">
        {count} {count === 1 ? singularLabel : pluralLabel} en total
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={!hasPrevious}
          onClick={() =>
            onPageChange(
              Math.max(1, currentPage - 1)
            )
          }
          className={paginationButtonClassName}
        >
          Anterior
        </Button>

        <span className="min-w-24 text-center text-sm text-zinc-400">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          disabled={!hasNext}
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          className={paginationButtonClassName}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
