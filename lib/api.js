import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import githubData from "/data/github_test.json";

const root = join(process.cwd(), "contributors");

export function formatSlug(slug) {
  return slug.replace(/\.md$/, "");
}

export function getContributorsSlugs() {
  const contributorSlugs = [];
  fs.readdirSync(`${root}`).forEach((file) => {
    contributorSlugs.push({ file: file });
  });

  return contributorSlugs;
}

export function getContributorBySlug(file) {
  const fullPath = join(root, `${formatSlug(file)}.md`);
  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));

  return {
    file: file,
    slug: formatSlug(file),
    path: fullPath,
    content: content,
    githubData: githubData[file] ?? [],
    ...data,
  };
}

export function getContributors() {
  const contributors = getContributorsSlugs()
    .map((path) => getContributorBySlug(path.file))
    .sort((x, y) => (x.joining_date > y.joining_date ? -1 : 1));
  return contributors;
}
