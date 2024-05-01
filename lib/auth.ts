export const isAuthenticated = (req: Request) => {
  const API_KEY = process.env.LEADERBOARD_API_KEY;
  return API_KEY ? req.headers.get("Authorization") === API_KEY : true;
};
