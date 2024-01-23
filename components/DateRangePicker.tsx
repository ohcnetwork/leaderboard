import React from "react";
import { Popover } from "@headlessui/react";
import {
  format,
  subDays,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";

type DateRange = { start: Date; end: Date };

type Props = {
  value?: DateRange;
  onChange: (value: DateRange) => void;
};

const DateRangePicker = (props: Props) => {
  const startDate = props.value?.start ?? new Date();
  const endDate = props.value?.end ?? new Date();
  const rangePresets = getRangePresets();

  return (
    <div className="relative inline-block text-left whitespace-nowrap">
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button
              className={`px-4 py-2 font-medium rounded-md block w-full p-2 sm:text-sm border border-gray-600 dark:border-gray-300 ${
                open
                  ? "text-background bg-foreground"
                  : "text-foreground bg-background"
              }`}
            >
              {`${formatDate(startDate)} → ${formatDate(endDate)}`}
            </Popover.Button>
            <Popover.Panel className="absolute z-10 mt-2 bg-background rounded-lg shadow-lg shadow-primary-500 border border-primary-400">
              <div className="flex flex-col p-4">
                <div className="flex gap-2 justify-between items-center text-sm font-bold">
                  <input
                    type="date"
                    name="start"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      props.onChange({
                        start: e.target.valueAsDate ?? new Date(),
                        end: endDate,
                      })
                    }
                    className="block w-48 text-center p-2 rounded-md border border-gray-600 dark:border-gray-300 bg-transparent text-foreground"
                  />
                  <span className="text-base font-bold">→</span>
                  <input
                    type="date"
                    name="end"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      props.onChange({
                        start: startDate,
                        end: e.target.valueAsDate ?? new Date(),
                      })
                    }
                    className="block w-48 text-center p-2 rounded-md border border-gray-600 dark:border-gray-300 bg-transparent text-foreground"
                  />
                </div>

                <div className="flex flex-wrap items-start justify-center gap-2 mt-6">
                  {rangePresets.map((range, index) => (
                    <button
                      key={index}
                      className="hover:bg-white hover:text-black px-2 py-1 text-sm whitespace-nowrap rounded border border-gray-500 transition-all duration-100 ease-in-out"
                      onClick={() => props.onChange(range.value)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </div>
  );
};

export default DateRangePicker;

export const formatDate = (date: Date) => {
  return format(date, "MMM dd, yyyy");
};

const getRangePresets = () => {
  const today = new Date();
  const prevYear = new Date(today.getFullYear() - 1, 0, 1);
  const prevMonth = subMonths(today, 1);

  return [
    {
      label: "Last 7 days",
      value: {
        start: subDays(today, 7),
        end: today,
      },
    },
    {
      label: "Last 28 days",
      value: {
        start: subDays(today, 28),
        end: today,
      },
    },
    {
      label: format(today, "MMM, yyyy"),
      value: {
        start: startOfMonth(today),
        end: endOfMonth(today),
      },
    },
    {
      label: format(prevMonth, "MMM, yyyy"),
      value: {
        start: startOfMonth(prevMonth),
        end: endOfMonth(prevMonth),
      },
    },
    {
      label: "Last 365 days",
      value: {
        start: subDays(today, 365),
        end: today,
      },
    },
    {
      label: `Prev. Year (${prevYear.getFullYear()})`,
      value: {
        start: startOfYear(prevYear),
        end: endOfYear(prevYear),
      },
    },
    {
      label: `Curr. Year (${today.getFullYear()})`,
      value: {
        start: startOfYear(today),
        end: endOfYear(today),
      },
    },
  ];
};
