"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addDays, format } from "date-fns";
import { Filter, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export interface ActivityGraphFilterProps {
  selectedActivityTypes: Set<string>;
  activityTypes: string[];
  toggleActivityType: (type: string) => void;
  selectAllTypes: () => void;
  clearAllTypes: () => void;
  hasActiveFilters: boolean;
}

interface ActivityGraphProps {
  activities: Array<{
    activity_definition_name: string;
    occurred_at: Date | string;
  }>;
  activityDefinitions: Array<{ name: string }>;
  startDate: Date;
  endDate: Date;
  onFilterChange?: (filterProps: ActivityGraphFilterProps) => void;
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

function computeLevel(count: number): number {
  if (count === 0) return 0;
  if (count >= 10) return 4;
  if (count >= 6) return 3;
  if (count >= 3) return 2;
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
  breakdown: Record<string, number>;
  isOutOfRange: boolean;
}

export function ActivityGraphFilterButton({
  selectedActivityTypes,
  activityTypes,
  toggleActivityType,
  selectAllTypes,
  clearAllTypes,
  hasActiveFilters,
}: ActivityGraphFilterProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAllTypes}
          className="h-8"
        >
          <X className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Activity Type</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {selectedActivityTypes.size}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter by Activity Type</h4>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={selectAllTypes}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={clearAllTypes}
                >
                  None
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activityTypes.map((activityType) => (
                <div key={activityType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`graph-${activityType}`}
                    checked={selectedActivityTypes.has(activityType)}
                    onCheckedChange={() => toggleActivityType(activityType)}
                  />
                  <label
                    htmlFor={`graph-${activityType}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {activityType}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function ActivityGraph({
  activities,
  activityDefinitions,
  startDate,
  endDate,
  onFilterChange,
}: ActivityGraphProps) {
  const activityTypes = useMemo(
    () => activityDefinitions.map((def) => def.name).sort(),
    [activityDefinitions],
  );

  const [deselectedTypes, setDeselectedTypes] = useState<Set<string>>(
    () => new Set(),
  );

  const selectedActivityTypes = useMemo(
    () => new Set(activityTypes.filter((t) => !deselectedTypes.has(t))),
    [activityTypes, deselectedTypes],
  );

  const hasActiveFilters = deselectedTypes.size > 0;

  const toggleActivityType = useCallback((type: string) => {
    setDeselectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const selectAllTypes = useCallback(() => {
    setDeselectedTypes(new Set());
  }, []);

  const clearAllTypes = useCallback(() => {
    setDeselectedTypes((prev) => {
      const all = new Set(prev);
      activityTypes.forEach((t) => all.add(t));
      return all;
    });
  }, [activityTypes]);

  useEffect(() => {
    onFilterChange?.({
      selectedActivityTypes,
      activityTypes,
      toggleActivityType,
      selectAllTypes,
      clearAllTypes,
      hasActiveFilters,
    });
  }, [
    selectedActivityTypes,
    activityTypes,
    toggleActivityType,
    selectAllTypes,
    clearAllTypes,
    hasActiveFilters,
    onFilterChange,
  ]);

  const gridStartDate = getPreviousSunday(startDate);
  const gridEndDate = getNextSaturday(endDate);

  const { weeks, monthLabels } = useMemo(() => {
    const activityByDate: Record<string, Record<string, number>> = {};
    for (const a of activities) {
      if (!selectedActivityTypes.has(a.activity_definition_name)) continue;
      const dateKey = format(a.occurred_at, "yyyy-MM-dd");
      if (!activityByDate[dateKey]) activityByDate[dateKey] = {};
      activityByDate[dateKey][a.activity_definition_name] =
        (activityByDate[dateKey][a.activity_definition_name] || 0) + 1;
    }

    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    let cursor = new Date(gridStartDate);
    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    while (cursor <= gridEndDate) {
      const dateKey = format(cursor, "yyyy-MM-dd");
      const breakdown = activityByDate[dateKey] || {};
      const count = Object.values(breakdown).reduce((s, n) => s + n, 0);
      const isOutOfRange = cursor < rangeStart || cursor > rangeEnd;

      currentWeek.push({
        date: dateKey,
        count: isOutOfRange ? 0 : count,
        level: isOutOfRange ? 0 : computeLevel(count),
        breakdown: isOutOfRange ? {} : breakdown,
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

    return { weeks, monthLabels };
  }, [
    activities,
    selectedActivityTypes,
    gridStartDate,
    gridEndDate,
    startDate,
    endDate,
  ]);

  return (
    <div className="relative">
      <TooltipProvider>
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-1"
            style={{
              gridTemplateColumns: `auto repeat(${weeks.length}, 11px)`,
              gridTemplateRows: "auto repeat(7, 11px)",
            }}
          >
            {/* Top-left empty corner */}
            <div />

            {/* Month labels row */}
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
                    className="text-xs text-muted-foreground px-0.5 whitespace-nowrap"
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
                    key={`gap-end`}
                    style={{ gridColumn: `span ${weeks.length - col}` }}
                  />,
                );
              }
              return cells;
            })()}

            {/* Day rows (0=Sun, 1=Mon, ..., 6=Sat) */}
            {Array.from({ length: 7 }, (_, dayIndex) => (
              <React.Fragment key={dayIndex}>
                <div
                  className="text-xs text-muted-foreground pr-2 flex items-center justify-end"
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
                          <div className="text-xs space-y-1">
                            <div className="font-medium">
                              {format(new Date(day.date), "EEE, d MMM yyyy")}
                            </div>
                            {Object.keys(day.breakdown).length > 0 ? (
                              <div className="space-y-0.5">
                                {Object.entries(day.breakdown)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([type, count]) => (
                                    <div
                                      key={type}
                                      className="flex items-center justify-between gap-3 text-accent-foreground"
                                    >
                                      <span className="truncate max-w-38">
                                        {type}
                                      </span>
                                      <span className="font-medium">
                                        {count}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-accent-foreground">
                                No activities
                              </div>
                            )}
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
        <span>Less</span>
        <div className="flex gap-1">
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
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
