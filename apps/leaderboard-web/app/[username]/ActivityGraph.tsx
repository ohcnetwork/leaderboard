"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { format } from "date-fns";

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
    occured_at: Date | string;
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

  // Animation state
  const [isAnimating, setIsAnimating] = useState(true);
  const [animatedTypes, setAnimatedTypes] = useState<Set<string>>(new Set());

  // Get activity types from activity definitions (sorted by name)
  const activityTypes = useMemo(() => {
    return activityDefinitions.map((def) => def.name).sort();
  }, [activityDefinitions]);

  // Get unique activity types that actually have data
  const activeActivityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((activity) => {
      types.add(activity.activity_definition_name);
    });
    return Array.from(types).sort();
  }, [activities]);

  // Animate activity types on mount
  useEffect(() => {
    if (activeActivityTypes.length === 0) {
      setIsAnimating(false);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < activeActivityTypes.length) {
        const activityType = activeActivityTypes[currentIndex];
        if (activityType) {
          setAnimatedTypes((prev) => {
            const newSet = new Set(prev);
            newSet.add(activityType);
            return newSet;
          });
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50); // 50ms delay between each activity type

    return () => clearInterval(interval);
  }, [activeActivityTypes]);

  // Group activities by date and type for tooltip display
  const activityByDateAndType = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};

    activities.forEach((activity) => {
      const dateKey = format(activity.occured_at, "yyyy-MM-dd");
      if (dateKey) {
        if (!grouped[dateKey]) {
          grouped[dateKey] = {};
        }
        const typeName = activity.activity_definition_name;
        grouped[dateKey][typeName] = (grouped[dateKey][typeName] || 0) + 1;
      }
    });

    return grouped;
  }, [activities]);

  // Filter activities by type and recalculate graph data
  const filteredData = useMemo(() => {
    // Determine which types to include
    let typesToInclude: Set<string>;

    if (selectedActivityTypes.size > 0) {
      // User has manually selected types
      typesToInclude = selectedActivityTypes;
    } else if (isAnimating) {
      // During animation, only show animated types
      typesToInclude = animatedTypes;
    } else {
      // Animation complete and no filters, show all
      return data.map((day) => ({
        ...day,
        activityBreakdown: activityByDateAndType[day.date] || {},
      }));
    }

    // Filter activities by included types
    const filteredActivities = activities.filter((activity) =>
      typesToInclude.has(activity.activity_definition_name)
    );

    // Group by date
    const activityByDate: Record<string, number> = {};
    const activityBreakdownByDate: Record<string, Record<string, number>> = {};

    filteredActivities.forEach((activity) => {
      const dateKey = format(activity.occured_at, "yyyy-MM-dd");
      if (dateKey) {
        activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;

        if (!activityBreakdownByDate[dateKey]) {
          activityBreakdownByDate[dateKey] = {};
        }
        const typeName = activity.activity_definition_name;
        activityBreakdownByDate[dateKey][typeName] =
          (activityBreakdownByDate[dateKey][typeName] || 0) + 1;
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
      return {
        ...day,
        count,
        level,
        activityBreakdown: activityBreakdownByDate[day.date] || {},
      };
    });
  }, [
    data,
    activities,
    selectedActivityTypes,
    isAnimating,
    animatedTypes,
    activityByDateAndType,
  ]);

  // Group data by weeks (7 days each)
  const weeks: Array<
    Array<{
      date: string;
      count: number;
      level: number;
      activityBreakdown: Record<string, number>;
    }>
  > = [];
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
                        "w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary",
                        "transition-all duration-300 ease-in-out",
                        getLevelColor(day.level)
                      )}
                      style={{
                        opacity: day.level === 0 || !isAnimating ? 1 : 0,
                        animation:
                          day.level > 0 && isAnimating
                            ? "fadeIn 300ms ease-in-out forwards"
                            : undefined,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <div className="font-medium">
                        {format(new Date(day.date), "EEE, d MMM yyyy")}
                      </div>
                      {Object.keys(day.activityBreakdown).length > 0 ? (
                        <div className="space-y-0.5">
                          {Object.entries(day.activityBreakdown)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type, count]) => (
                              <div
                                key={type}
                                className="flex items-center justify-between gap-3 text-muted"
                              >
                                <span className="truncate max-w-38">
                                  {type}
                                </span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-muted">No activities</div>
                      )}
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
