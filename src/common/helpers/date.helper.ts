/**
 * Parses a date string and sets time to noon UTC to avoid
 * timezone shifts that push dates to the previous/next day.
 *
 * Example: "2026-02-02" → 2026-02-02T12:00:00.000Z (not midnight)
 */
export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}
