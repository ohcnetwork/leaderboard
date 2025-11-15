import { permanentRedirect } from "next/navigation";
import { getAllContributorUsernames } from "@/lib/db";

interface ContributorsRedirectProps {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username) => ({ username }));
}

export default async function ContributorsRedirect({
  params,
}: ContributorsRedirectProps) {
  const { username } = await params;
  permanentRedirect(`/${username}`);
}
