"use client";

import { useId, useState } from "react";
import { Check, LoaderCircle, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type SearchableComboboxOption = {
  value: string;
  label: string;
};

type SearchableComboboxProps = {
  id: string;
  query: string;
  onQueryChange: (query: string) => void;
  options: SearchableComboboxOption[];
  selectedOption: SearchableComboboxOption | null;
  onSelect: (option: SearchableComboboxOption | null) => void;
  placeholder: string;
  emptyOptionLabel: string;
  loading: boolean;
  error: boolean;
  emptyMessage: string;
  selectedLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  onRetry?: () => void;
};

export default function SearchableCombobox({
  id,
  query,
  onQueryChange,
  options,
  selectedOption,
  onSelect,
  placeholder,
  emptyOptionLabel,
  loading,
  error,
  emptyMessage,
  selectedLabel = "Selección actual",
  disabled = false,
  invalid = false,
  onRetry,
}: SearchableComboboxProps) {
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-listbox`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = loading || error ? 1 : options.length + 1;

  function select(option: SearchableComboboxOption | null) {
    onSelect(option);
    onQueryChange("");
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          id={id}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-invalid={invalid}
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => (current + 1) % itemCount);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                current <= 0 ? itemCount - 1 : current - 1
              );
            } else if (event.key === "Enter" && open && !loading && !error) {
              event.preventDefault();
              select(activeIndex === 0 ? null : options[activeIndex - 1] ?? null);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          className="h-11 border-white/10 bg-black/30 pl-10 text-white"
        />

        {open && !disabled && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-40 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-white/10 bg-zinc-950 p-1 shadow-2xl shadow-black/50"
          >
            <button
              id={`${listboxId}-option-0`}
              type="button"
              role="option"
              aria-selected={!selectedOption}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(0)}
              onClick={() => select(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-300 outline-none",
                activeIndex === 0 && "bg-white/10 text-white"
              )}
            >
              {emptyOptionLabel}
              {!selectedOption && <Check className="h-4 w-4 text-red-400" />}
            </button>

            {loading && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-zinc-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm text-red-300">
                <span>No fue posible cargar los resultados.</span>
                {onRetry && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={onRetry}
                  >
                    Reintentar
                  </Button>
                )}
              </div>
            )}

            {!loading && !error && options.length === 0 && (
              <p className="px-3 py-3 text-sm text-zinc-500">{emptyMessage}</p>
            )}

            {!loading &&
              !error &&
              options.map((option, index) => {
                const optionIndex = index + 1;
                const selected = selectedOption?.value === option.value;

                return (
                  <button
                    id={`${listboxId}-option-${optionIndex}`}
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(optionIndex)}
                    onClick={() => select(option)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-zinc-300 outline-none",
                      activeIndex === optionIndex && "bg-white/10 text-white"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-red-400" />}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {selectedOption && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">{selectedLabel}</p>
            <p className="truncate text-sm font-medium text-white">
              {selectedOption.label}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => select(null)}
            disabled={disabled}
            aria-label="Quitar selección"
            className="shrink-0 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
