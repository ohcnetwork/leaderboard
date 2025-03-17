"use client";

import { useEffect, useState } from "react";
import ActivityCalendar from "react-activity-calendar";
import ActivityModal from "@/components/contributors/ActivityModal";
import { useTheme } from "next-themes";

// Define the type for activity data
interface ActivityData {
  date: string;
  count: number;
  level: number;
}

interface ActivityCalendarProps {
  calendarData: ActivityData[];
}
export default function ActivityCalendarGit({
  calendarData,
}: ActivityCalendarProps) {
  // Force rendering the calendar only on browser as the component throws the
  // following when attempted to render on server side.
  //
  // calcTextDimensions() requires browser APIs
  const [isBrowser, setIsBrowser] = useState(false);
  const [year, setYear] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(
    null,
  );

  useEffect(() => {
    setIsBrowser(
      !(typeof document === "undefined" || typeof window === "undefined"),
    );
  }, []);

  const { theme } = useTheme();

  const getFirstContribYear = (): number => {
    if (!calendarData.length) return new Date().getFullYear();

    return Math.min(
      ...calendarData.map((data) => Number(data.date.slice(0, 4))),
    );
  };
  const currentYear = new Date().getFullYear();
  const firstYear = getFirstContribYear();
  const yearsList = Array.from(
    { length: currentYear - firstYear + 1 },
    (_, i) => currentYear - i,
  );
  // Set default year to the most recent year with data
  useEffect(() => {
    if (yearsList.length > 0 && year === 0) {
      setYear(yearsList[0]); // Set default only if not already set
    }
  }, [yearsList]);

  const getDisplayData = (): ActivityData[] => {
    if (year === 0) {
      return [...calendarData].sort((a, b) => a.date.localeCompare(b.date));
    }

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    // Create array of all dates in the year
    const allDates: ActivityData[] = [];
    const current = new Date(yearStart);

    while (current <= yearEnd) {
      allDates.push({
        date: current.toISOString().split("T")[0],
        count: 0,
        level: 0,
      });
      current.setDate(current.getDate() + 1);
    }

    // Merge with actual contribution data
    const yearData = calendarData.filter((d) =>
      d.date.startsWith(year.toString()),
    );
    yearData.forEach((contribution) => {
      const index = allDates.findIndex((d) => d.date === contribution.date);
      if (index !== -1) {
        allDates[index] = contribution;
      }
    });

    return allDates;
  };

  return (
    <div className="gap-3 sm:flex">
      {isBrowser && (
        <div className="rounded-lg bg-secondary-100 px-6 py-8 text-center text-foreground hover:cursor-pointer dark:bg-secondary-800 sm:px-10 xl:text-left">
          <ActivityCalendar
            colorScheme={theme === "dark" ? "dark" : "light"}
            showWeekdayLabels
            data={getDisplayData()}
            theme={{
              light: ["#e5e7eb", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
              dark: ["#374151", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
            }}
            eventHandlers={{
              onClick: (event) => (data) => {
                setIsOpen(true);
                setSelectedActivity(data);
              },
            }}
            labels={{
              totalCount:
                "{{count}} contributions in " +
                (year === 0 ? "all years" : year),
            }}
          />
        </div>
      )}
      <div className="mt-2 flex gap-2 sm:mt-0 sm:flex-col">
        {yearsList.map((y) => {
          return (
            <button
              key={y}
              className={
                y !== year
                  ? "flex h-10 w-24 items-center justify-center rounded-lg bg-secondary-100 text-sm text-foreground hover:bg-secondary-700 dark:bg-secondary-800"
                  : "flex h-10 w-24 items-center justify-center rounded-lg bg-primary-500 text-sm text-white"
              }
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          );
        })}
      </div>
      {selectedActivity && (
        <ActivityModal
          isOpen={isOpen}
          activityData={selectedActivity}
          closeFunc={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
