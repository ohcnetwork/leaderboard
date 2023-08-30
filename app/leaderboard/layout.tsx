import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Leaderboard | ${process.env.NEXT_PUBLIC_PAGE_TITLE}`,
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
