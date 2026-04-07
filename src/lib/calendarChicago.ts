import { DateTime } from "luxon";

export const CHICAGO = "America/Chicago";

export function eventDayKeyChicago(iso: string): string {
  return DateTime.fromISO(iso, { zone: "utc" }).setZone(CHICAGO).toFormat("yyyy-MM-dd");
}

export function formatEventRange(startIso: string, endIso: string | null): string {
  const start = DateTime.fromISO(startIso, { zone: "utc" }).setZone(CHICAGO);
  if (!endIso) {
    return start.toFormat("EEEE, MMM d, yyyy · h:mm a");
  }
  const end = DateTime.fromISO(endIso, { zone: "utc" }).setZone(CHICAGO);
  if (start.hasSame(end, "day")) {
    return `${start.toFormat("EEEE, MMM d, yyyy")} · ${start.toFormat("h:mm a")} – ${end.toFormat("h:mm a")}`;
  }
  return `${start.toFormat("MMM d, h:mm a")} – ${end.toFormat("MMM d, h:mm a, yyyy")}`;
}

/** Month grid: year/month are calendar month in Chicago (month 1–12). */
export function buildMonthCells(year: number, month: number): (number | null)[] {
  const first = DateTime.fromObject({ year, month, day: 1 }, { zone: CHICAGO });
  const dim = first.daysInMonth ?? 31;
  const pad = first.toJSDate().getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  return cells;
}

export function dayKeyForCell(year: number, month: number, day: number): string {
  return DateTime.fromObject({ year, month, day }, { zone: CHICAGO }).toFormat("yyyy-MM-dd");
}

export function nowChicago(): DateTime {
  return DateTime.now().setZone(CHICAGO);
}
