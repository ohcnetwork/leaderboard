const timeSince = (ts_str: string) => {
  const timestamp = new Date(ts_str);
  const now = new Date();
  const seconds = (now.getTime() - timestamp.getTime()) / 1000;

  if (seconds < 60) {
    return (seconds | 0) + "s ago";
  }

  if (seconds < 3600) {
    return ((seconds / 60) | 0) + "m ago";
  }

  if (seconds <= 86400) {
    return ((seconds / 3600) | 0) + "h ago";
  }

  return "on " + timestamp.toLocaleDateString();
};

export default timeSince;
