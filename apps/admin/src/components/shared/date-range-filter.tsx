"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  DateRangePreset,
  FinancialDateRange,
} from "@/lib/financial-date";
import { getPresetDateRange } from "@/lib/financial-date";

const PRESETS: Array<{
  value: DateRangePreset;
  label: string;
}> = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "custom", label: "Personalizado" },
];

type DateRangeFilterProps = {
  preset: DateRangePreset;
  value: FinancialDateRange;
  onPresetChange: (preset: DateRangePreset, range: FinancialDateRange) => void;
  onChange: (range: FinancialDateRange) => void;
};

export default function DateRangeFilter({
  preset,
  value,
  onPresetChange,
  onChange,
}: DateRangeFilterProps) {
  const isInvalid = Boolean(
    value.dateFrom && value.dateTo && value.dateFrom > value.dateTo
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (option.value === "custom") {
                onPresetChange(option.value, value);
                return;
              }
              onPresetChange(option.value, getPresetDateRange(option.value));
            }}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium transition",
              preset === option.value
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-zinc-400">
            Desde
            <Input
              type="date"
              value={value.dateFrom}
              onChange={(event) => onChange({
                ...value,
                dateFrom: event.target.value,
              })}
              className="mt-2 border-white/10 bg-black/30 text-white"
            />
          </label>
          <label className="text-sm text-zinc-400">
            Hasta
            <Input
              type="date"
              value={value.dateTo}
              onChange={(event) => onChange({
                ...value,
                dateTo: event.target.value,
              })}
              className="mt-2 border-white/10 bg-black/30 text-white"
            />
          </label>
        </div>
      )}

      {isInvalid && (
        <p className="mt-3 text-sm text-red-400">
          La fecha inicial no puede ser posterior a la fecha final.
        </p>
      )}
    </div>
  );
}
