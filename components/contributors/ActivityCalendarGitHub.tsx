"use client";

import { useEffect, useState, useMemo } from "react";
import ActivityCalendar from "react-activity-calendar";
import ActivityModal from "@/components/contributors/ActivityModal";
import { useTheme } from "next-themes";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
  types?: string[];
}

interface ActivityModalData extends ContributionDay {
  isOpen: boolean;
}

const THEMES = {
  light: ["#e5e7eb", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
  dark: ["#374151", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
} as const;

export default function ActivityCalendarGit({
  calendarData,
}: {
  calendarData: ContributionDay[];
}) {
  // Client-side rendering check
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Theme
  const { theme } = useTheme();

  // States
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalData, setModalData] = useState<ActivityModalData>({
    isOpen: false,
    date: "",
    count: 0,
    level: 0,
  });

  // Memoized data processing
  const contributionsMap = useMemo(() => {
    return new Map(calendarData.map((entry) => [entry.date, entry]));
  }, [calendarData]);

  const availableYears = useMemo(() => {
    if (!calendarData.length) return [currentYear];

    const yearsSet = new Set(
      calendarData.map((entry) => new Date(entry.date).getFullYear()),
    );
    yearsSet.add(currentYear);

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [calendarData, currentYear]);

  const getYearDataWithContinuity = (year: number): ContributionDay[] => {
    // Find the first Sunday before January 1st
    const startDate = new Date(year, 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Find the last Saturday after December 31st
    const endDate = new Date(year, 11, 31);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const yearDates: ContributionDay[] = [];
    const currentDate = new Date(startDate);

    // Generate all dates including partial weeks
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      yearDates.push(
        contributionsMap.get(dateStr) || {
          date: dateStr,
          count: 0,
          level: 0,
        },
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return yearDates;
  };

  // Memoize the year data to prevent unnecessary recalculations
  const currentYearData = useMemo(
    () => getYearDataWithContinuity(selectedYear),
    [selectedYear, contributionsMap],
  );

  if (!isBrowser) {
    return null;
  }

  return (
    <div className="gap-3 sm:flex">
      <div className="rounded-lg bg-secondary-100 px-6 py-8 text-center text-foreground hover:cursor-pointer dark:bg-secondary-800 sm:px-10 xl:text-left">
        <ActivityCalendar
          colorScheme={theme === "dark" ? "dark" : "light"}
          showWeekdayLabels
          hideMonthLabels={false}
          hideTotalCount={false}
          data={currentYearData}
          theme={THEMES}
          eventHandlers={{
            onClick: (event) => (data) => {
              setModalData({
                ...data,
                isOpen: true,
              });
            },
          }}
          labels={{
            totalCount: `{{count}} contributions in ${selectedYear}`,
          }}
        />

        <ActivityModal
          isopen={modalData.isOpen}
          activityData={modalData}
          closeFunc={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>

      <div className="mt-2 flex gap-2 sm:mt-0 sm:flex-col">
        {availableYears.map((year) => (
          <button
            key={year}
            className={`
              flex h-10 w-24 items-center justify-center rounded-lg text-sm 
              transition-colors duration-200 ease-in-out
              ${
                year === selectedYear
                  ? "bg-primary-500 text-white"
                  : "bg-secondary-100 text-foreground hover:bg-secondary-700 dark:bg-secondary-800"
              }
            `}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}
