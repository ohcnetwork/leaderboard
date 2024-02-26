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
  className?: string;
};

const DateRangePicker = (props: Props) => {
  const startDate = props.value?.start ?? new Date();
  const endDate = props.value?.end ?? new Date();
  const rangePresets = getRangePresets();

  return (
    <div className={props.className}>
      <div className="inline-block relative w-full text-left whitespace-nowrap">
        <Popover>
          {({ open, close }) => (
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
              <Popover.Panel className="z-10 absolute border-primary-400 bg-background shadow-lg shadow-primary-500 mt-2 border rounded-lg">
                <div className="flex flex-col p-4">
                  <div className="flex justify-between items-center gap-2 font-bold text-sm">
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
                      className="block border-gray-600 dark:border-gray-300 bg-transparent p-2 border rounded-md w-48 text-center text-foreground"
                    />
                    <span className="font-bold text-base">→</span>
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
                      className="block border-gray-600 dark:border-gray-300 bg-transparent p-2 border rounded-md w-48 text-center text-foreground"
                    />
                  </div>

                  <div className="gap-2 grid grid-cols-2 mt-6">
                    {rangePresets.map((range, index) => (
                      <button
                        key={index}
                        className="border-gray-500 hover:bg-primary-800 hover:dark:bg-white px-2 py-1 border rounded text-sm hover:text-white hover:dark:text-black whitespace-nowrap transition-all duration-100 ease-in-out"
                        onClick={() => {
                          props.onChange(range.value);
                          close();
                        }}
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
      label: "Yesterday",
      value: {
        start: subDays(today, 1),
        end: subDays(today, 1),
      },
    },
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
      label: "Last 365 days",
      value: {
        start: subDays(today, 365),
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
