import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get date range for a specific period
 * @param period - The time period (week, month, or year)
 * @returns Object with startDate and endDate
 */
export function getDateRange(period: "week" | "month" | "year"): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "year":
      startDate.setDate(endDate.getDate() - 365);
      break;
  }

  return { startDate, endDate };
}

/**
 * Format a date as a human-readable "time ago" string
 * @param date - The date to format
 * @returns Human-readable time string (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Generate activity graph data for the last N days
 * @param activityByDate - Object with date keys and activity counts
 * @param days - Number of days to include (default 365)
 * @returns Array of objects with date and count for each day
 */
export function generateActivityGraphData(
  activityByDate: Record<string, number>,
  days: number = 365
): Array<{ date: string; count: number; level: number }> {
  const data: Array<{ date: string; count: number; level: number }> = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    if (!dateKey) continue;

    const count = activityByDate[dateKey] || 0;

    // Calculate level (0-4) for color intensity like GitHub
    let level = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 6) level = 3;
    if (count >= 10) level = 4;

    data.push({ date: dateKey, count, level });
  }

  return data;
}

/**
 * Get the start and end dates of a month for a given date
 * @param date - The date to get month boundaries for
 * @returns Object with start and end dates of the month
 */
export function getMonthBoundaries(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

export type MonthKey = `${number}-${number}`;

/**
 * Get month identifier string (e.g., "2025-11")
 * @param date - The date to get month key for
 * @returns Month key string in YYYY-MM format
 */
export function getMonthKey(date: Date): MonthKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}` as MonthKey;
}

/**
 * Format month for display (e.g., "November 2025")
 * @param monthKey - Month key in YYYY-MM format
 * @returns Formatted month string
 */
export function formatMonthHeader(monthKey: MonthKey): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year!), parseInt(month!) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Group activities by month with sorted month keys
 * @param activities - Array of activities with occured_at dates
 * @returns Map of month keys to arrays of activities, sorted newest to oldest
 */
export function groupActivitiesByMonth<T extends { occured_at: Date }>(
  activities: T[]
): Map<MonthKey, T[]> {
  const grouped = new Map<MonthKey, T[]>();

  // Group activities by month
  activities.forEach((activity) => {
    const monthKey = getMonthKey(activity.occured_at);
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(activity);
  });

  // Sort the map by month keys (newest to oldest)
  const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
    return b[0].localeCompare(a[0]); // Reverse chronological order
  });

  return new Map(sortedEntries);
}
