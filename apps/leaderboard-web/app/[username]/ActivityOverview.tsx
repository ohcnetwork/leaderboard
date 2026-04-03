"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import ActivityGraph, {
  ActivityGraphFilterButton,
  ActivityGraphFilterProps,
} from "./ActivityGraph";

interface ActivityOverviewProps {
  activities: Array<{
    activity_definition_name: string;
    occured_at: Date | string;
  }>;
  activityDefinitions: Array<{ name: string }>;
}

type YearSelection = "last-year" | number;

export default function ActivityOverview({
  activities,
  activityDefinitions,
}: ActivityOverviewProps) {
  const [filterProps, setFilterProps] =
    useState<ActivityGraphFilterProps | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearSelection>("last-year");

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const a of activities) {
      const d = new Date(a.occured_at);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [activities]);

  const { startDate, endDate } = useMemo(() => {
    if (selectedYear === "last-year") {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end };
    }
    return {
      startDate: new Date(selectedYear, 0, 1),
      endDate: new Date(selectedYear, 11, 31),
    };
  }, [selectedYear]);

  const filteredActivities = useMemo(() => {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return activities.filter((a) => {
      const t = new Date(a.occured_at).getTime();
      return t >= start && t <= end;
    });
  }, [activities, startDate, endDate]);

  const totalInRange = filteredActivities.length;

  const rangeLabel =
    selectedYear === "last-year" ? "in the last year" : `in ${selectedYear}`;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Activity Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              {totalInRange} contribution{totalInRange !== 1 ? "s" : ""}{" "}
              {rangeLabel}
            </p>
          </div>
          {filterProps && <ActivityGraphFilterButton {...filterProps} />}
        </div>
      </CardHeader>
      <CardContent>
        <ActivityGraph
          activities={activities}
          activityDefinitions={activityDefinitions}
          startDate={startDate}
          endDate={endDate}
          onFilterChange={setFilterProps}
        />

        {/* Year switcher + legend row */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant={selectedYear === "last-year" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setSelectedYear("last-year")}
            >
              Last year
            </Button>
            {availableYears.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-3"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
