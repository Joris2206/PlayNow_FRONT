export type DateRangePreset = "today" | "week" | "month" | "custom";

export type FinancialDateRange = {
  dateFrom: string;
  dateTo: string;
};

export function formatLocalCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPresetDateRange(
  preset: Exclude<DateRangePreset, "custom">,
  now = new Date()
): FinancialDateRange {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);

  if (preset === "week") {
    const mondayOffset = (end.getDay() + 6) % 7;
    start.setDate(end.getDate() - mondayOffset);
  } else if (preset === "month") {
    start.setDate(1);
  }

  return {
    dateFrom: formatLocalCalendarDate(start),
    dateTo: formatLocalCalendarDate(end),
  };
}

export function getCurrentMonthSelection(now = new Date()) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}
