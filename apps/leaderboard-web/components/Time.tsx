"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

type TimeVariant = "relative" | "absolute" | "date" | "month-year";

interface TimeProps {
  date: Date | string;
  variant?: TimeVariant;
  className?: string;
  /** Auto-refresh interval in ms for relative times (default: 60000). Set 0 to disable. */
  refreshInterval?: number;
}

function formatAbsolute(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatByVariant(date: Date, variant: TimeVariant): string {
  switch (variant) {
    case "relative":
      return formatRelative(date);
    case "absolute":
      return formatAbsolute(date);
    case "date":
      return formatDate(date);
    case "month-year":
      return formatMonthYear(date);
  }
}

export default function Time({
  date,
  variant = "relative",
  className,
  refreshInterval = 60_000,
}: TimeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const timestamp = dateObj.getTime();
  const [, setTick] = useState(0);

  useEffect(() => {
    // Force a re-render on mount so React replaces the SSG text with
    // the client-locale value (hydration keeps the server HTML as-is
    // because of suppressHydrationWarning).
    const mountTimer = setTimeout(() => setTick(1), 0);

    if (variant !== "relative" || refreshInterval <= 0) {
      return () => clearTimeout(mountTimer);
    }

    const intervalId = setInterval(
      () => setTick((t) => t + 1),
      refreshInterval,
    );

    return () => {
      clearTimeout(mountTimer);
      clearInterval(intervalId);
    };
  }, [timestamp, variant, refreshInterval]);

  return (
    <time
      dateTime={dateObj.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatByVariant(dateObj, variant)}
    </time>
  );
}
