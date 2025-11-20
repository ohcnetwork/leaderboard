"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  idPrefix?: string;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  idPrefix = "date-range",
}: DateRangeFilterProps) {
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();

    if (days === 7) {
      start.setDate(start.getDate() - 7);
    } else if (days === 30) {
      start.setMonth(start.getMonth() - 1);
    } else if (days === 90) {
      start.setMonth(start.getMonth() - 3);
    } else if (days === 365) {
      start.setFullYear(start.getFullYear() - 1);
    }

    onStartDateChange(format(start, "yyyy-MM-dd"));
    onEndDateChange(format(end, "yyyy-MM-dd"));
  };

  return (
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

          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset(7)}
                className="h-8"
              >
                Last 1 wk
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset(30)}
                className="h-8"
              >
                Last 1 mo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset(90)}
                className="h-8"
              >
                Last 3 mo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset(365)}
                className="h-8"
              >
                Last 1 yr
              </Button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">
              Custom Range
            </Label>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-start-date`} className="text-sm">
                Start Date
              </Label>
              <Input
                id={`${idPrefix}-start-date`}
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-end-date`} className="text-sm">
                End Date
              </Label>
              <Input
                id={`${idPrefix}-end-date`}
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
