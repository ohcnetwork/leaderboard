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
