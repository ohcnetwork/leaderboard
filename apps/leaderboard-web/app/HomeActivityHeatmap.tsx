"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addDays, format } from "date-fns";
import React, { useMemo } from "react";

interface HomeActivityHeatmapProps {
  dailyCounts: Record<string, number>;
  startDate: Date;
  endDate: Date;
}

const LEVEL_CSS_VARS = [
  "var(--activity-graph-0)",
  "var(--activity-graph-1)",
  "var(--activity-graph-2)",
  "var(--activity-graph-3)",
  "var(--activity-graph-4)",
] as const;

const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function computeLevel(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

function getPreviousSunday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  if (day !== 0) d.setDate(d.getDate() - day);
  return d;
}

function getNextSaturday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  if (day !== 6) d.setDate(d.getDate() + (6 - day));
  return d;
}

interface DayCell {
  date: string;
  count: number;
  level: number;
  isOutOfRange: boolean;
}

export default function HomeActivityHeatmap({
  dailyCounts,
  startDate,
  endDate,
}: HomeActivityHeatmapProps) {
  const gridStartDate = getPreviousSunday(startDate);
  const gridEndDate = getNextSaturday(endDate);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const v of Object.values(dailyCounts)) {
      if (v > m) m = v;
    }
    return m;
  }, [dailyCounts]);

  const { weeks, monthLabels, totalActivities } = useMemo(() => {
    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    let cursor = new Date(gridStartDate);
    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);
    let totalActivities = 0;

    while (cursor <= gridEndDate) {
      const dateKey = format(cursor, "yyyy-MM-dd");
      const isOutOfRange = cursor < rangeStart || cursor > rangeEnd;
      const count = isOutOfRange ? 0 : (dailyCounts[dateKey] ?? 0);
      totalActivities += count;

      currentWeek.push({
        date: dateKey,
        count,
        level: isOutOfRange ? 0 : computeLevel(count, maxCount),
        isOutOfRange,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      cursor = addDays(cursor, 1);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const monthLabels: { label: string; colStart: number; colSpan: number }[] =
      [];
    let prevMonth = -1;
    let currentLabel: (typeof monthLabels)[0] | null = null;

    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w];
      if (!week) continue;
      const representativeDay = week.find((d) => !d.isOutOfRange) ?? week[0];
      if (!representativeDay) continue;
      const d = new Date(representativeDay.date);
      const month = d.getMonth();

      if (month !== prevMonth) {
        if (currentLabel) monthLabels.push(currentLabel);
        currentLabel = {
          label: MONTH_NAMES[month] ?? "",
          colStart: w,
          colSpan: 1,
        };
        prevMonth = month;
      } else if (currentLabel) {
        currentLabel.colSpan++;
      }
    }
    if (currentLabel) monthLabels.push(currentLabel);

    return { weeks, monthLabels, totalActivities };
  }, [dailyCounts, maxCount, gridStartDate, gridEndDate, startDate, endDate]);

  return (
    <div className="relative">
      <TooltipProvider>
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-[3px]"
            style={{
              gridTemplateColumns: `auto repeat(${weeks.length}, 11px)`,
              gridTemplateRows: "auto repeat(7, 11px)",
            }}
          >
            <div />

            {(() => {
              const cells: React.ReactNode[] = [];
              let col = 0;
              for (const ml of monthLabels) {
                if (ml.colStart > col) {
                  cells.push(
                    <div
                      key={`gap-${col}`}
                      style={{ gridColumn: `span ${ml.colStart - col}` }}
                    />,
                  );
                }
                cells.push(
                  <div
                    key={`month-${ml.colStart}`}
                    className="text-[10px] text-muted-foreground px-0.5 whitespace-nowrap"
                    style={{ gridColumn: `span ${ml.colSpan}` }}
                  >
                    {ml.label}
                  </div>,
                );
                col = ml.colStart + ml.colSpan;
              }
              if (col < weeks.length) {
                cells.push(
                  <div
                    key="gap-end"
                    style={{ gridColumn: `span ${weeks.length - col}` }}
                  />,
                );
              }
              return cells;
            })()}

            {Array.from({ length: 7 }, (_, dayIndex) => (
              <React.Fragment key={dayIndex}>
                <div
                  className="text-[10px] text-muted-foreground pr-1.5 flex items-center justify-end"
                  style={{ gridRow: dayIndex + 2, gridColumn: 1 }}
                >
                  {DAY_LABELS[dayIndex] || ""}
                </div>

                {weeks.map((week, weekIndex) => {
                  const day = week[dayIndex];
                  if (!day) return null;

                  return (
                    <Tooltip
                      key={`${weekIndex}-${dayIndex}`}
                      delayDuration={100}
                    >
                      <TooltipTrigger asChild>
                        <div
                          className="w-[11px] h-[11px] outline-1 -outline-offset-1 outline-transparent hover:outline-foreground/50 transition-colors"
                          style={{
                            gridRow: dayIndex + 2,
                            gridColumn: weekIndex + 2,
                            borderRadius: "var(--activity-graph-radius)",
                            backgroundColor: day.isOutOfRange
                              ? "transparent"
                              : LEVEL_CSS_VARS[day.level],
                          }}
                        />
                      </TooltipTrigger>
                      {!day.isOutOfRange && (
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">
                              {format(new Date(day.date), "EEE, d MMM yyyy")}
                            </div>
                            <div className="text-accent-foreground">
                              {day.count}{" "}
                              {day.count === 1 ? "activity" : "activities"}
                            </div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">
          {totalActivities.toLocaleString()} activities in the last{" "}
          {Math.round(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          )}{" "}
          days
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {LEVEL_CSS_VARS.map((color, i) => (
            <div
              key={i}
              className="w-[11px] h-[11px]"
              style={{
                borderRadius: "var(--activity-graph-radius)",
                backgroundColor: color,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
