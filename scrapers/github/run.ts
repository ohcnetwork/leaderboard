import prepare from "@/scrapers/github/prepare";
import { octokit } from "@/scrapers/github/utils/octokit";
import { PGlite } from "@electric-sql/pglite";

const requiredEventTypes = [
  "IssueCommentEvent",
  "IssuesEvent",
  "PullRequestEvent",
  "PullRequestReviewEvent",
];

const getOrgEvents = async (org: string) => {
  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    { org },
    (response) =>
      response.data.filter((event) => requiredEventTypes.includes(event.type))
  );
  return events;
};

async function run(db: PGlite) {
  await prepare(db);
}

export default run;
