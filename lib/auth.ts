export const isAuthenticated = (req: Request) => {
  const API_KEY = process.env.LEADERBOARD_API_KEY;
  return API_KEY ? req.headers.get("Authorization") === API_KEY : true;
};

export const isAuthenticatedForCron = (req: Request) => {
  const cronSecret = process.env.CRON_SECRET;
  return cronSecret
    ? req.headers.get("Authorization") === `Bearer ${cronSecret}`
    : true;
};
