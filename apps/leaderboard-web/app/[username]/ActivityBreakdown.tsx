"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ActivityTrendChart from "../leaderboard/ActivityTrendChart";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import DateRangeFilter from "@/components/DateRangeFilter";
import { format } from "date-fns";

interface ActivityBreakdownProps {
  activities: Array<{
    activity_definition_name: string;
    occured_at: Date | string;
    points: number;
  }>;
  startDate?: Date;
  endDate?: Date;
}

// Color palette for different activity types
const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
];

export default function ActivityBreakdown({
  activities,
  startDate: initialStartDate,
  endDate: initialEndDate,
}: ActivityBreakdownProps) {
  // Date range filter state
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Filter activities by date range
  const filteredActivities = useMemo(() => {
    if (!filterStartDate && !filterEndDate) {
      return activities;
    }

    return activities.filter((activity) => {
      const activityDate = new Date(activity.occured_at);

      if (filterStartDate) {
        const start = new Date(filterStartDate);
        if (activityDate < start) return false;
      }

      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        if (activityDate > end) return false;
      }

      return true;
    });
  }, [activities, filterStartDate, filterEndDate]);

  // Recalculate breakdown based on filtered activities
  const filteredBreakdown = useMemo(() => {
    return filteredActivities.reduce((acc, activity) => {
      const key = activity.activity_definition_name;
      if (!acc[key]) {
        acc[key] = { count: 0, points: 0 };
      }
      acc[key].count += 1;
      acc[key].points += activity.points;
      return acc;
    }, {} as Record<string, { count: number; points: number }>);
  }, [filteredActivities]);

  const entries = Object.entries(filteredBreakdown)
    .filter(([, data]) => data.points > 0)
    .sort((a, b) => b[1].points - a[1].points);

  const totalActivities = entries.reduce(
    (sum, [, data]) => sum + data.count,
    0
  );
  const totalPoints = entries.reduce((sum, [, data]) => sum + data.points, 0);

  const clearFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters = filterStartDate !== "" || filterEndDate !== "";

  // Calculate date range if not provided (use filtered activities)
  const dateRange = useMemo(() => {
    if (initialStartDate && initialEndDate) {
      return { startDate: initialStartDate, endDate: initialEndDate };
    }

    if (filteredActivities.length === 0) {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: now,
      };
    }

    const dates = filteredActivities.map((a) => new Date(a.occured_at));
    return {
      startDate: new Date(Math.min(...dates.map((d) => d.getTime()))),
      endDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }, [filteredActivities, initialStartDate, initialEndDate]);

  // Group activities by type and date for trend charts (use filtered activities)
  const activityTrendData = useMemo(() => {
    const trendMap: Record<
      string,
      Array<{ date: string; count: number; points: number }>
    > = {};

    filteredActivities.forEach((activity) => {
      const activityName = activity.activity_definition_name;
      const dateKey = format(activity.occured_at, "yyyy-MM-dd");

      if (!trendMap[activityName]) {
        trendMap[activityName] = [];
      }

      const existingDay = trendMap[activityName].find(
        (d) => d.date === dateKey
      );
      if (existingDay) {
        existingDay.count += 1;
        existingDay.points += activity.points;
      } else {
        if (dateKey) {
          trendMap[activityName].push({
            date: dateKey,
            count: 1,
            points: activity.points,
          });
        }
      }
    });

    return trendMap;
  }, [filteredActivities]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalActivities} total activities · {totalPoints} total points
              {hasActiveFilters && " (filtered)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}

            {/* Date Range Filter */}
            <DateRangeFilter
              startDate={filterStartDate}
              endDate={filterEndDate}
              onStartDateChange={setFilterStartDate}
              onEndDateChange={setFilterEndDate}
              idPrefix="breakdown"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Proportional Bar Chart */}
        <div className="space-y-3">
          <TooltipProvider>
            <div className="flex h-8 w-full overflow-hidden rounded-lg">
              {entries.map(([activityName, data], index) => {
                const percentage = (data.points / totalPoints) * 100;
                return (
                  <Tooltip key={activityName} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "transition-all hover:opacity-80 cursor-pointer",
                          COLORS[index % COLORS.length]
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium">{activityName}</div>
                        <div className="text-muted-foreground">
                          {data.count} activities ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

          {/* Legend with Trend Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entries.map(([activityName, data], index) => {
              const percentage = (data.count / totalActivities) * 100;
              const trendData = activityTrendData[activityName] || [];

              return (
                <div
                  key={activityName}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded shrink-0",
                      COLORS[index % COLORS.length]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {activityName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {data.count} ({percentage.toFixed(1)}%)
                      </span>
                      {data.points > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-primary font-medium">
                            {data.points} pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Activity Trend Chart */}
                  <div className="shrink-0">
                    <ActivityTrendChart
                      dailyActivity={trendData}
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      mode="count"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalActivities}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Activities
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {entries.length}
            </div>
            <div className="text-xs text-muted-foreground">Activity Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalActivities > 0
                ? (totalPoints / totalActivities).toFixed(1)
                : "0"}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg Points/Activity
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
