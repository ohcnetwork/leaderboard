"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface Contributor {
  username: string;
  name: string | null;
  avatar_url: string | null;
  points: number;
  count: number;
}

interface TopContributorsChartProps {
  activityName: string;
  contributors: Contributor[];
}

export default function TopContributorsChart({
  activityName,
  contributors,
}: TopContributorsChartProps) {
  if (contributors.length === 0) return null;

  const top7 = contributors.slice(0, 7);

  const maxCount = Math.max(...top7.map((c) => c.count));

  // Calculate nice y-axis ticks
  const yTicks = getYTicks(maxCount);
  const yMax = yTicks[yTicks.length - 1] || maxCount;

  return (
    <div>
      <h3 className="font-semibold text-sm text-foreground mb-3">
        {activityName}
      </h3>
      <div className="flex gap-1">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-xs text-muted-foreground pr-1 pb-8 w-6 shrink-0">
          {[...yTicks].reverse().map((tick) => (
            <span key={tick} className="text-right leading-none">
              {tick}
            </span>
          ))}
        </div>

        {/* Bars area */}
        <div className="flex-1 flex flex-col">
          {/* Chart area */}
          <div
            className="relative flex items-end gap-1 border-b border-l border-border pl-1 pb-1"
            style={{ height: 120 }}
          >
            {/* Grid lines */}
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-dashed border-border/40"
                style={{
                  bottom: `${(tick / yMax) * 100}%`,
                }}
              />
            ))}

            {/* Bars */}
            {top7.map((contributor) => {
              const heightPercent =
                yMax > 0 ? (contributor.count / yMax) * 100 : 0;

              return (
                <TooltipProvider key={contributor.username} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/${contributor.username}`}
                        className="flex-1 flex items-end justify-center relative z-10"
                        style={{ height: "100%" }}
                      >
                        <div
                          className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors min-h-0.5"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">
                        {contributor.name || contributor.username}
                      </p>
                      <p className="text-muted-foreground">
                        {contributor.count}{" "}
                        {contributor.count === 1 ? "activity" : "activities"} ·{" "}
                        {contributor.points} pts
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* X-axis avatars */}
          <div className="flex gap-1 pt-1.5 pl-1">
            {top7.map((contributor) => (
              <Link
                key={contributor.username}
                href={`/${contributor.username}`}
                className="flex-1 flex justify-center"
              >
                <Avatar className="h-5 w-5 border">
                  <AvatarImage
                    src={contributor.avatar_url || undefined}
                    alt={contributor.name || contributor.username}
                  />
                  <AvatarFallback className="text-[8px]">
                    {(contributor.name || contributor.username)
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getYTicks(max: number): number[] {
  if (max <= 0) return [0];
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i);

  // Pick ~4 nice ticks
  const step = Math.ceil(max / 4);
  const niceStep =
    step <= 2 ? 2 : step <= 5 ? 5 : step <= 10 ? 10 : Math.ceil(step / 5) * 5;

  const ticks: number[] = [];
  for (let i = 0; i <= max; i += niceStep) {
    ticks.push(i);
  }
  // Ensure the top tick covers the max
  if (ticks[ticks.length - 1]! < max) {
    ticks.push(ticks[ticks.length - 1]! + niceStep);
  }
  return ticks;
}
