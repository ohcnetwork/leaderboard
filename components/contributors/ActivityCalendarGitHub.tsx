"use client";

import { useEffect, useState } from "react";
import ActivityCalendar from "react-activity-calendar";
import ActivityModal from "@/components/contributors/ActivityModal";
import { useTheme } from "next-themes";

export default function ActivityCalendarGit({
  calendarData,
}: {
  calendarData: any;
}) {
  // Force rendering the calendar only on browser as the component throws the
  // following when attempted to render on server side.
  //
  // calcTextDimensions() requires browser APIs
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(
      !(typeof document === "undefined" || typeof window === "undefined"),
    );
  }, []);

  const { theme } = useTheme();

  const getCalendarData = (year: number) => {
    const currentYear = year;
    let dates = [];
    let date = new Date(`01-01-${year}`);
    date.setDate(date.getDate() + 1);
    while (date.getFullYear() === currentYear) {
      dates.push({
        date: new Date(date).toISOString().split("T")[0],
        count: 0,
        level: 0,
      });
      date.setDate(date.getDate() + 1);
    }
    dates.push({
      date: new Date(date).toISOString().split("T")[0],
      count: 0,
      level: 0,
    });

    let calDates = calendarData.filter(
      (d: any) => d.date.slice(0, 4) === String(currentYear),
    );

    for (let i = 0; i < dates.length; i++)
      for (let j = 0; j < calDates.length; j++)
        if (dates[i].date === calDates[j].date) dates[i] = calDates[j];

    return dates;
  };

  const getFirstContribYear = () => {
    let i;
    for (i = 0; i < calendarData.length; i++)
      if (calendarData[i].count > 0) break;
    return Number(calendarData[i]?.date.slice(0, 4));
  };

  const lastNYears = (n: number) => {
    const currentYear = Number(new Date().getFullYear());
    let years = [];
    for (let i = 0; i <= n; i++) years.push(currentYear - i);
    return years;
  };

  const yearDiff = Number(new Date().getFullYear()) - getFirstContribYear();
  const yearsList = lastNYears(yearDiff);

  const [year, setYear] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activityData, setActivityData] = useState({});

  return (
    <div className="gap-3 sm:flex">
      {isBrowser && (
        <div className="rounded-lg bg-secondary-100 px-6 py-8 text-center text-foreground hover:cursor-pointer dark:bg-secondary-800 sm:px-10 xl:text-left">
          {year === 0 ? (
            <ActivityCalendar
              colorScheme={theme === "dark" ? "dark" : "light"}
              showWeekdayLabels
              data={calendarData}
              theme={{
                light: ["#e5e7eb", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
                dark: ["#374151", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
              }}
              eventHandlers={{
                onClick: (event) => (data) => {
                  setIsOpen(true);
                  setActivityData(data);
                },
              }}
              labels={{
                totalCount: "{{count}} contributions in the last year",
              }}
            />
          ) : (
            <ActivityCalendar
              colorScheme={theme === "dark" ? "dark" : "light"}
              showWeekdayLabels
              data={getCalendarData(year)}
              theme={{
                light: ["#e5e7eb", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
                dark: ["#374151", "#d3bff3", "#b08ee6", "#976ae2", "#6025c0"],
              }}
              eventHandlers={{
                onClick: (event) => (data) => {
                  setIsOpen(true);
                  setActivityData(data);
                },
              }}
            />
          )}

          <ActivityModal
            isopen={isOpen}
            activityData={activityData}
            closeFunc={() => setIsOpen(false)}
          />
        </div>
      )}
      <div className="mt-2 flex gap-2 sm:mt-0 sm:flex-col">
        {yearsList.map((y, i) => {
          return (
            <button
              key={i}
              className={
                y !== year
                  ? "flex h-10 w-24 items-center justify-center rounded-lg bg-secondary-100 text-sm text-foreground hover:bg-secondary-700 dark:bg-secondary-800"
                  : "flex h-10 w-24 items-center justify-center rounded-lg bg-primary-500 text-sm text-white"
              }
              onClick={(_) => setYear(y)}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}
