import { env } from "@/env.mjs";
import { getContributorBySlug } from "@/lib/api";
import { getDailyReport } from "@/lib/contributor";

export const revalidate = 900; // revalidates atmost once every 15 mins
export const maxDuration = 30;

const org = env.NEXT_PUBLIC_GITHUB_ORG;

/**
 * This API returns the following information about a contributor
 *
 * - PRs opened in last 24 hours
 * - Commits made to default branch in last 24 hours
 * - Reviews made in last 24 hours
 * - Assigned issues that are not closed yet.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const user = params.slug;
  try {
    // Check if contributor belongs to the organization
    await getContributorBySlug(user);
  } catch (e) {
    return Response.json(
      { error: `'${user}' is not a contributor of '${org}'` },
      {
        status: 404,
      },
    );
  }

  return Response.json(await getDailyReport(user));
}
