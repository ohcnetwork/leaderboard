"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";

export interface ActivityGraphFilterProps {
  selectedActivityTypes: Set<string>;
  activityTypes: string[];
  toggleActivityType: (type: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

interface ActivityGraphProps {
  data: Array<{ date: string; count: number; level: number }>;
  activities: Array<{
    activity_definition_name: string;
    occured_at: Date;
  }>;
  activityDefinitions: Array<{
    name: string;
  }>;
  onFilterChange?: (filterProps: ActivityGraphFilterProps) => void;
}

// Export the filter button component
export function ActivityGraphFilterButton({
  selectedActivityTypes,
  activityTypes,
  toggleActivityType,
  clearFilters,
  hasActiveFilters,
}: ActivityGraphFilterProps) {
  return (
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
            <h4 className="font-medium text-sm">Filter by Activity Type</h4>
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
  data,
  activities,
  activityDefinitions,
  onFilterChange,
}: ActivityGraphProps) {
  // Activity type filter state
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<
    Set<string>
  >(new Set());

  // Get activity types from activity definitions (sorted by name)
  const activityTypes = useMemo(() => {
    return activityDefinitions.map((def) => def.name).sort();
  }, [activityDefinitions]);

  // Filter activities by type and recalculate graph data
  const filteredData = useMemo(() => {
    if (selectedActivityTypes.size === 0) {
      return data;
    }

    // Filter activities by selected types
    const filteredActivities = activities.filter((activity) =>
      selectedActivityTypes.has(activity.activity_definition_name)
    );

    // Group by date
    const activityByDate: Record<string, number> = {};
    filteredActivities.forEach((activity) => {
      const dateKey = new Date(activity.occured_at).toISOString().split("T")[0];
      if (dateKey) {
        activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
      }
    });

    // Recalculate levels for each day in the data
    return data.map((day) => {
      const count = activityByDate[day.date] || 0;
      let level = 0;
      if (count > 0) {
        if (count >= 10) level = 4;
        else if (count >= 7) level = 3;
        else if (count >= 4) level = 2;
        else level = 1;
      }
      return { ...day, count, level };
    });
  }, [data, activities, selectedActivityTypes]);

  // Group data by weeks (7 days each)
  const weeks: Array<Array<{ date: string; count: number; level: number }>> =
    [];
  for (let i = 0; i < filteredData.length; i += 7) {
    weeks.push(filteredData.slice(i, i + 7));
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
    setSelectedActivityTypes(new Set());
  };

  const hasActiveFilters = selectedActivityTypes.size > 0;

  // Notify parent component of filter state changes
  useMemo(() => {
    if (onFilterChange) {
      onFilterChange({
        selectedActivityTypes,
        activityTypes,
        toggleActivityType,
        clearFilters,
        hasActiveFilters,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivityTypes, activityTypes, hasActiveFilters, onFilterChange]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted";
      case 1:
        return "bg-primary/20";
      case 2:
        return "bg-primary/40";
      case 3:
        return "bg-primary/60";
      case 4:
        return "bg-primary/80";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <div className="flex gap-1 overflow-x-auto pb-4">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <Tooltip key={`${weekIndex}-${dayIndex}`} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-primary",
                        getLevelColor(day.level)
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{day.date}</div>
                      <div className="text-muted-foreground">
                        {day.count}{" "}
                        {day.count === 1 ? "activity" : "activities"}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("w-3 h-3 rounded-sm", getLevelColor(level))}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
