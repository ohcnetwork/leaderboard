/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { getContributorBySlug } from "@/lib/api";
import { ImageResponse } from "next/og";
import { GoCodeReview, GoGitPullRequest } from "react-icons/go";
import { MdUpdate } from "react-icons/md";

export const size = {
  width: 1000,
  height: 500,
};

export default async function Image({ params }: { params: { slug: string } }) {
  const github_username = params.slug;
  const contributor = await getContributorBySlug(github_username, true);
  const logoImage = "https://avatars.githubusercontent.com/u/62014451?v=4";
  const profileImage =
    "https://avatars.githubusercontent.com/" + github_username;
  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-wrap bg-white border-b-[30px] border-solid border-purple-600">
        <div tw="relative flex">
          <img
            tw="m-8 h-52 w-52 rounded-full"
            src={profileImage}
            alt={github_username}
            height={208}
            width={208}
          />
          <div tw="ml-2 flex w-[70%] flex-col">
            <div tw="mt-8 flex h-1/2 flex-col">
              <h2
                tw="text-3xl"
                style={{ fontFamily: "Inter", fontWeight: "400" }}
              >
                {github_username}
              </h2>
              <p
                tw="text-2xl"
                style={{ fontFamily: "Inter", fontWeight: "400" }}
              >
                {contributor.content}
              </p>
            </div>
            <div tw="mt-12 flex text-3xl">
              <div tw="flex flex-col items-center justify-center">
                <GoGitPullRequest size={30} />
                <span tw="my-4">Pull Request</span>
                <span>{contributor.highlights.pr_opened}</span>
              </div>
              <div tw="mx-20 flex flex-col items-center justify-center">
                <GoCodeReview size={30} />
                <span tw="my-4">Reviews</span>
                <span>{contributor.highlights.pr_reviewed}</span>
              </div>
              <div tw="flex flex-col items-center justify-center">
                <MdUpdate size={30} />
                <span tw="my-4">Feed Updates</span>
                <span>{contributor.highlights.eod_update}</span>
              </div>
            </div>
            <img
              style={{
                position: "absolute",
                right: 0,
                top: "10px",
              }}
              src={logoImage}
              alt="organization_logo"
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
