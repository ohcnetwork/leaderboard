import { useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import ActivityModal from './ActivityModal';

export default function ActivityCalendarGit({ calendarData }) {
  const getCalendarData = (year) => {
    const currentYear = year;
    let dates = [];
    let date = new Date(`01-01-${year}`);
    date.setDate(date.getDate() + 1);
    while (date.getFullYear() === currentYear) {
      dates.push({
        date: new Date(date).toISOString().split('T')[0],
        count: 0,
        level: 0,
      });
      date.setDate(date.getDate() + 1);
    }
    dates.push({
      date: new Date(date).toISOString().split('T')[0],
      count: 0,
      level: 0,
    });

    let calDates = calendarData.filter(
      (d) => d.date.slice(0, 4) === String(currentYear)
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

  const lastNYears = (n) => {
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
    <div className="sm:flex gap-3">
      <div
        className="py-8 bg-gray-800 text-gray-100 text-center rounded-lg px-6 sm:px-10 xl:text-left hover:cursor-pointer"
        suppressHydrationWarning
      >
        {year === 0 ? (
          <ActivityCalendar
            showWeekdayLabels
            data={calendarData}
            theme={{
              level0: '#374151',
              level1: '#d3bff3',
              level2: '#b08ee6',
              level3: '#976ae2',
              level4: '#6025c0',
              level5: '#4d1e9a',
              level6: '#380d80',
              level7: '#35156b',
              level8: '#1f0d40',
            }}
            eventHandlers={{
              onClick: (event) => (data) => {
                setIsOpen(true);
                setActivityData(data);
              },
            }}
            labels={{ totalCount: '{{count}} contributions in the last year' }}
          />
        ) : (
          <ActivityCalendar
            showWeekdayLabels
            data={getCalendarData(year)}
            theme={{
              level0: '#374151',
              level1: '#d3bff3',
              level2: '#b08ee6',
              level3: '#976ae2',
              level4: '#6025c0',
              level5: '#4d1e9a',
              level6: '#380d80',
              level7: '#35156b',
              level8: '#1f0d40',
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
      <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0">
        {yearsList.map((y, i) => {
          return (
            <button
              key={i}
              className={
                y !== year
                  ? 'h-10 w-24 rounded-lg bg-gray-800 text-gray-100 text-sm flex justify-center items-center hover:bg-gray-700'
                  : 'h-10 w-24 rounded-lg bg-primary-500 text-white text-sm flex justify-center items-center'
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
