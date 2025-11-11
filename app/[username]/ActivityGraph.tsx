"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface ActivityGraphProps {
  data: Array<{ date: string; count: number; level: number }>;
}

export default function ActivityGraph({ data }: ActivityGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);

  // Group data by weeks (7 days each)
  const weeks: Array<Array<{ date: string; count: number; level: number }>> =
    [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

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
      <div className="flex gap-1 overflow-x-auto pb-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-primary",
                  getLevelColor(day.level)
                )}
                onMouseEnter={() =>
                  setHoveredDay({ date: day.date, count: day.count })
                }
                onMouseLeave={() => setHoveredDay(null)}
                title={`${day.date}: ${day.count} ${
                  day.count === 1 ? "activity" : "activities"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md border">
          <div className="font-medium">{hoveredDay.date}</div>
          <div className="text-muted-foreground">
            {hoveredDay.count} {hoveredDay.count === 1 ? "activity" : "activities"}
          </div>
        </div>
      )}

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

