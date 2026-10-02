"use client";

import { useRef } from "react";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

type DateInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  pickerLabel?: string;
};

export default function DateInput({
  className,
  disabled,
  onClick,
  pickerLabel = "Abrir calendario",
  ...props
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const input = inputRef.current;
    if (!input || disabled) return;

    input.focus({ preventScroll: true });
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // Focusing the native date input remains the safe fallback.
      }
    }
  }

  return (
    <div className="relative">
      <Input
        {...props}
        ref={inputRef}
        type="date"
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || typeof event.currentTarget.showPicker !== "function") {
            return;
          }

          event.preventDefault();
          openPicker();
        }}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        aria-label={pickerLabel}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-zinc-500 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500/60 disabled:pointer-events-none disabled:opacity-50"
      >
        <CalendarDays className="h-4 w-4" />
      </button>
    </div>
  );
}
