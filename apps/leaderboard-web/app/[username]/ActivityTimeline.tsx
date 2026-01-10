"use client";

import { useState, useMemo, useEffect } from "react";
import { ContributorActivity } from "@/lib/data/types";
import { ActivityDefinition } from "@ohcnetwork/leaderboard-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X, ChevronDown } from "lucide-react";
import ActivityTimelineItem from "./ActivityTimelineItem";
import DateRangeFilter from "@/components/DateRangeFilter";
import {
  groupActivitiesByMonth,
  formatMonthHeader,
  MonthKey,
} from "@/lib/utils";

const ACTIVITY_FILTER_STORAGE_KEY = "leaderboard_activity_type_filter";

interface ActivityTimelineProps {
  activities: ContributorActivity[];
  activityDefinitions: ActivityDefinition[];
}

export default function ActivityTimeline({
  activities,
  activityDefinitions,
}: ActivityTimelineProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [visibleMonths, setVisibleMonths] = useState<number>(1);

  // Initialize selectedActivityTypes from localStorage
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<
    Set<string>
  >(() => {
    if (typeof window === "undefined") return new Set();

    try {
      const stored = localStorage.getItem(ACTIVITY_FILTER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load activity type filter from localStorage:",
        error
      );
    }
    return new Set();
  });

  // Save activity type filter to localStorage whenever it changes
  useEffect(() => {
    try {
      if (selectedActivityTypes.size > 0) {
        localStorage.setItem(
          ACTIVITY_FILTER_STORAGE_KEY,
          JSON.stringify(Array.from(selectedActivityTypes))
        );
      } else {
        localStorage.removeItem(ACTIVITY_FILTER_STORAGE_KEY);
      }
    } catch (error) {
      console.error(
        "Failed to save activity type filter to localStorage:",
        error
      );
    }
  }, [selectedActivityTypes]);

  // Get activity types from activity definitions (sorted by name)
  const activityTypes = useMemo(() => {
    return activityDefinitions.map((def) => def.name).sort();
  }, [activityDefinitions]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Filter by date range
      if (startDate) {
        const activityDate = new Date(activity.occured_at);
        const start = new Date(startDate);
        if (activityDate < start) return false;
      }
      if (endDate) {
        const activityDate = new Date(activity.occured_at);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        if (activityDate > end) return false;
      }

      // Filter by activity type
      if (
        selectedActivityTypes.size > 0 &&
        !selectedActivityTypes.has(activity.activity_name)
      ) {
        return false;
      }

      return true;
    });
  }, [activities, startDate, endDate, selectedActivityTypes]);

  // Group filtered activities by month and paginate
  const { visibleActivities, totalMonths, nextMonthName, shouldResetMonths } =
    useMemo(() => {
      const grouped = groupActivitiesByMonth(filteredActivities);
      const monthKeys = Array.from(grouped.keys());

      // Check if we need to reset visibleMonths (when filters reduce available months)
      const needsReset =
        visibleMonths > monthKeys.length && monthKeys.length > 0;

      const visibleMonthKeys = monthKeys.slice(0, visibleMonths);

      // Flatten visible months into a single array with month headers
      const visible: Array<
        | ContributorActivity
        | { isMonthHeader: true; monthKey: MonthKey; count: number }
      > = [];
      visibleMonthKeys.forEach((monthKey) => {
        const monthActivities = grouped.get(monthKey) || [];
        visible.push({
          isMonthHeader: true,
          monthKey,
          count: monthActivities.length,
        });
        visible.push(...monthActivities);
      });

      const nextMonth = monthKeys[visibleMonths];
      const nextMonthFormatted = nextMonth
        ? formatMonthHeader(nextMonth)
        : null;

      return {
        visibleActivities: visible,
        totalMonths: monthKeys.length,
        nextMonthName: nextMonthFormatted,
        shouldResetMonths: needsReset,
      };
    }, [filteredActivities, visibleMonths]);

  // Reset visible months when filters significantly reduce available data
  if (shouldResetMonths && visibleMonths !== 1) {
    setVisibleMonths(1);
  }

  const toggleActivityType = (activityType: string) => {
    const newSelected = new Set(selectedActivityTypes);
    if (newSelected.has(activityType)) {
      newSelected.delete(activityType);
    } else {
      newSelected.add(activityType);
    }
    setSelectedActivityTypes(newSelected);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedActivityTypes(new Set());
    setVisibleMonths(1);
  };

  const hasActiveFilters =
    startDate !== "" || endDate !== "" || selectedActivityTypes.size > 0;

  const loadMore = () => {
    setVisibleMonths((prev) => prev + 1);
  };

  const hasMore = visibleMonths < totalMonths;

  // Count visible activities (excluding month headers)
  const visibleActivityCount = visibleActivities.filter(
    (item) => !("isMonthHeader" in item)
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {visibleActivityCount} of {filteredActivities.length} activities
              {hasActiveFilters && " (filtered)"}
              {totalMonths > 0 && (
                <span className="ml-1">
                  · {visibleMonths} of {totalMonths} month
                  {totalMonths !== 1 ? "s" : ""}
                </span>
              )}
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
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              idPrefix="timeline"
            />

            {/* Activity Type Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  Activity Type
                  {selectedActivityTypes.size > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                      {selectedActivityTypes.size}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">
                    Filter by Activity Type
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activityTypes.map((activityType) => (
                      <div
                        key={activityType}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={activityType}
                          checked={selectedActivityTypes.has(activityType)}
                          onCheckedChange={() =>
                            toggleActivityType(activityType)
                          }
                        />
                        <label
                          htmlFor={activityType}
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {activities.length === 0
                ? "No activities yet"
                : "No activities match the selected filters"}
            </p>
          ) : (
            <>
              {visibleActivities.map((item) => {
                if ("isMonthHeader" in item) {
                  return (
                    <div
                      key={`month-${item.monthKey}`}
                      className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-muted/50 backdrop-blur-sm border-y"
                    >
                      <h3 className="text-sm font-semibold">
                        {formatMonthHeader(item.monthKey)}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {item.count} activit{item.count !== 1 ? "ies" : "y"}
                        </span>
                      </h3>
                    </div>
                  );
                }
                return <ActivityTimelineItem key={item.slug} activity={item} />;
              })}
              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    className="w-full sm:w-auto"
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More ({nextMonthName})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
