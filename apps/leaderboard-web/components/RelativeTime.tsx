"use client";

import Time from "@/components/Time";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Time date={dateObj} variant="relative" className={className} />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <Time date={dateObj} variant="absolute" />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
