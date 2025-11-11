"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActivityBreakdownProps {
  activityBreakdown: Record<string, { count: number; points: number }>;
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
  activityBreakdown,
}: ActivityBreakdownProps) {
  const entries = Object.entries(activityBreakdown).sort(
    (a, b) => b[1].count - a[1].count
  );

  const totalActivities = entries.reduce(
    (sum, [, data]) => sum + data.count,
    0
  );
  const totalPoints = entries.reduce((sum, [, data]) => sum + data.points, 0);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Activity Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalActivities} total activities · {totalPoints} total points
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Proportional Bar Chart */}
        <div className="space-y-3">
          <TooltipProvider>
            <div className="flex h-8 w-full overflow-hidden rounded-lg">
              {entries.map(([activityName, data], index) => {
                const percentage = (data.count / totalActivities) * 100;
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

          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entries.map(([activityName, data], index) => {
              const percentage = (data.count / totalActivities) * 100;
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
