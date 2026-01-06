import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

type NumberAggregateValue = {
  type: "number";
  value: number;
  unit?: string;
  format?: "integer" | "decimal" | "percentage" | "duration" | "bytes" | "currency";
  decimals?: number;
};

type NumberStatisticsAggregateValue = {
  type: "statistics/number";
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  variance?: number;
  sum?: number;
  count?: number;
  unit?: string;
  format?: string;
  highlightMetric?: "min" | "max" | "mean" | "median" | "variance" | "sum" | "count";
};

type StringAggregateValue = {
  type: "string";
  value: string;
};

type AggregateValue =
  | NumberAggregateValue
  | NumberStatisticsAggregateValue
  | StringAggregateValue;

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
    const dateKey = format(date, "yyyy-MM-dd");
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
export function groupActivitiesByMonth<T extends { occured_at: Date | string }>(
  activities: T[]
): Map<MonthKey, T[]> {
  const grouped = new Map<MonthKey, T[]>();

  // Group activities by month
  activities.forEach((activity) => {
    const date = activity.occured_at instanceof Date 
      ? activity.occured_at 
      : new Date(activity.occured_at);
    const monthKey = getMonthKey(date);
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

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human readable string
 */
function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format an aggregate value based on its type
 * @param value - The aggregate value to format
 * @returns Formatted string representation
 */
export function formatAggregateValue(value: AggregateValue): string {
  if (value.type === "string") {
    return value.value;
  }

  if (value.type === "statistics/number") {
    // For statistics, show the highlight metric or mean
    const metricKey = value.highlightMetric || "mean";
    const metricValue = value[metricKey];
    
    if (metricValue === undefined) {
      return "N/A";
    }

    // Format the metric value
    let formatted = metricValue.toLocaleString();
    
    if (value.unit) {
      formatted += ` ${value.unit}`;
    }

    return formatted;
  }

  if (value.type === "number") {
    const { value: numValue, format, unit, decimals = 2 } = value;

    switch (format) {
      case "percentage":
        return `${(numValue * 100).toFixed(decimals)}%`;
      
      case "duration":
        return formatDuration(numValue);
      
      case "bytes":
        return formatBytes(numValue);
      
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: unit || "USD",
        }).format(numValue);
      
      case "decimal":
        return numValue.toFixed(decimals) + (unit ? ` ${unit}` : "");
      
      case "integer":
      default:
        const formatted = Math.round(numValue).toLocaleString();
        return unit ? `${formatted} ${unit}` : formatted;
    }
  }

  return String(value);
}
