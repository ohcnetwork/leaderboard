import { Metadata } from "next";
import { env } from "@/env.mjs";

export const metadata: Metadata = {
  title: `Leaderboard | ${env.NEXT_PUBLIC_PAGE_TITLE}`,
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
