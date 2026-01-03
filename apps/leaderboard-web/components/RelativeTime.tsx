"use client";

import { formatTimeAgo } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Format absolute time like: "Monday, November 11, 2025 at 2:30 PM"
  const absoluteTime = format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <time dateTime={dateObj.toISOString()} className={className}>
            {formatTimeAgo(dateObj)}
          </time>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">{absoluteTime}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
