"use client";

import { useState, useMemo } from "react";
import { ContributorActivity } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ActivityTimelineItem from "./ActivityTimelineItem";

interface ActivityTimelineProps {
  activities: ContributorActivity[];
}

export default function ActivityTimeline({
  activities,
}: ActivityTimelineProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<
    Set<string>
  >(new Set());

  // Get unique activity types
  const activityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((activity) => {
      types.add(activity.activity_name);
    });
    return Array.from(types).sort();
  }, [activities]);

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
  };

  const hasActiveFilters =
    startDate !== "" || endDate !== "" || selectedActivityTypes.size > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Timeline</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredActivities.length} of {activities.length} activities
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                  {(startDate || endDate) && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                      {startDate && endDate ? "2" : "1"}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Filter by Date Range</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="start-date" className="text-sm">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate || undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
          {filteredActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {activities.length === 0
                ? "No activities yet"
                : "No activities match the selected filters"}
            </p>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityTimelineItem key={activity.slug} activity={activity} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
