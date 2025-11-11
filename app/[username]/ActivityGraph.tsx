"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityGraphProps {
  data: Array<{ date: string; count: number; level: number }>;
}

export default function ActivityGraph({ data }: ActivityGraphProps) {
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
