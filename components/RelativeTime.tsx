type Props = {
  time: string | Date | number;
  className?: string;
};

export default function RelativeTime(props: Props) {
  const time = new Date(props.time);
  const relative = getRelativeTimeString(time);
  const absolute = time.toString();

  return (
    <time
      dateTime={absolute}
      title={absolute}
      className={props.className ?? "underline"}
    >
      {relative}
    </time>
  );
}

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;
const ONE_MONTH = 30.4375 * ONE_DAY;

const getRelativeTimeString = (timestamp: Date) => {
  const now = new Date();
  const seconds = ((now.getTime() - timestamp.getTime()) / 1000) | 0;

  const as = (unit: string, secondsInUnit = 1) => {
    const duration = (seconds / secondsInUnit) | 0;
    return duration === 1 ? `a ${unit} ago` : `${duration} ${unit}s ago`;
  };

  if (seconds < ONE_MINUTE) return as("second");
  if (seconds < ONE_HOUR) return as("minute", ONE_MINUTE);
  if (seconds < ONE_DAY) return as("hour", ONE_HOUR);
  if (seconds < ONE_WEEK) return as("day", ONE_DAY);
  if (seconds < ONE_MONTH) return as("week", ONE_WEEK);
  return as("month", ONE_MONTH);
};
