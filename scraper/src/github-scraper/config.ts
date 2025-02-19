import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { paginateGraphQL } from "@octokit/plugin-paginate-graphql";

const MyOctokit = Octokit.plugin(paginateRest, paginateGraphQL);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN not found in environment");
  process.exit(1);
}

export const octokit = new MyOctokit({
  auth: GITHUB_TOKEN,
});
