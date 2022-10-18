export const parametreize = (string) => {
  return string.replace(/\s/gu, "_").toLowerCase();
};

export const humanize = (str) => {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const parseDateString = (dateStr) => {
  const date = new Date(dateStr);

  if (date == "Invalid Date") return "";

  let dateString = date.getDate() + " ";
  dateString += months[date.getMonth()] + " ";
  dateString += date.getFullYear() + " | ";
  if (date.getHours() === 0) {
    dateString += "12:";
  } else {
    dateString += date.getHours() < 10 ? "0" : "";
    dateString +=
      (date.getHours() > 12
        ? date.getHours() - 12 < 10
          ? "0" + (date.getHours() - 12)
          : date.getHours() - 12
        : date.getHours()) + ":";
  }
  dateString +=
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  dateString += date.getHours() > 11 ? " PM" : " AM";
  return dateString;
};

// Calculate week number
export const getWeekNumber = (date) => {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

export const getWeek = (date) => {
  // +2 for tuesday to monday week offset
  var firstday = new Date(date.setDate(date.getDate() - date.getDay() + 2));
  var lastday = new Date(date.setDate(date.getDate() - date.getDay() + 6 + 2));
  const s = `${firstday.getDate() + " " + months[firstday.getMonth()]}-${lastday.getDate() + " " + months[lastday.getMonth()]} ${date.getFullYear()}`
  return s
}
export const getLastWeekDateRangeString = () => {
  let today = new Date();
  let lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  let start = String(lastWeek.getDate()).padStart(2, "0");
  if (today.getMonth() !== lastWeek.getMonth()) {
    start += ` ${months[lastWeek.getMonth()]}`;
  }

  let end = `${String(today.getDate()).padStart(2, "0")}`;
  end += ` ${months[today.getMonth()]} ${today.getFullYear()}`;

  return `${start} - ${end}`;
};
