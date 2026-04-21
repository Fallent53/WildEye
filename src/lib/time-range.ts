import { Observation, TimeRangeFilter } from "./types";

export const TIME_RANGE_OPTIONS: Array<{ value: TimeRangeFilter; label: string }> = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
  { value: "five-years", label: "5 ans" },
  { value: "all", label: "Toujours" },
];

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

function formatApiDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getTimeRangeStart(range: TimeRangeFilter, now = new Date()) {
  switch (range) {
    case "day":
      return subtractDays(now, 1);
    case "week":
      return subtractDays(now, 7);
    case "month":
      return subtractDays(now, 31);
    case "year":
      return subtractDays(now, 365);
    case "five-years":
      return subtractDays(now, 365 * 5);
    case "all":
      return null;
  }
}

export function isObservationInTimeRange(obs: Observation, range: TimeRangeFilter) {
  const start = getTimeRangeStart(range);
  if (!start) return true;

  const observedAt = new Date(obs.observed_at);
  if (Number.isNaN(observedAt.getTime())) return false;

  return observedAt >= start;
}

export function getExternalDateRange(range: TimeRangeFilter) {
  const start = getTimeRangeStart(range);
  if (!start) return undefined;

  return {
    from: formatApiDate(start),
    to: formatApiDate(new Date()),
  };
}
