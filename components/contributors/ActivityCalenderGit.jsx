import { useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import ActivityModal from './ActivityModel';

export default function ActivityCalenderGit({ calendarData }) {
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

    let datesCopy = dates.slice();

    for (let i = 0; i < datesCopy.length; i++) {
      for (let j = 0; j < calDates.length; j++) {
        if (datesCopy[i].date === calDates[j].date) {
          dates[i] = calDates[j];
        }
      }
    }

    return dates;
  };

  const lastFiveYears = (() => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = 0; i < 5; i++) years.push(currentYear - i);
    return years;
  })();

  const [year, setYear] = useState(lastFiveYears[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [activityData, setActivityData] = useState({});

  return (
    <>
      <div className="p-2 py-8 bg-gray-800 text-gray-100 text-center rounded-lg px-6 sm:px-10 xl:text-left mt-4">
        <ActivityCalendar
          showWeekdayLabels
          data={getCalendarData(year)}
          theme={{
            level0: '#3A3B41',
            level1: '#104D2F',
            level2: '#027E3B',
            level3: '#28AF44',
            level4: '#39d353',
            level5: '#50f26b',
          }}
          eventHandlers={{
            onClick: (event) => (data) => {
              console.log({ event, data });
              setIsOpen(true);
              setActivityData(data);
            },
            onMouseEnter: (event) => (data) => console.log('mouseEnter'),
          }}
        ></ActivityCalendar>
        <ActivityModal
          isopen={isOpen}
          activityData={activityData}
          closeFunc={() => setIsOpen(false)}
        />
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {lastFiveYears.map((y) => {
          return (
            <button
              className={
                y !== year
                  ? 'h-12 rounded-lg bg-gray-800 text-gray-100 flex justify-center items-center hover:bg-gray-700'
                  : 'h-12 rounded-lg bg-green-600 text-white flex justify-center items-center'
              }
              onClick={(_) => setYear(y)}
            >
              {y}
            </button>
          );
        })}
      </div>
    </>
  );
}
