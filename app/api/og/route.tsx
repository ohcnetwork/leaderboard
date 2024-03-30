/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { GoGitPullRequest } from "react-icons/go";
import { GoCodeReview } from "react-icons/go";
import { MdUpdate } from "react-icons/md";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const decodedUrl = decodeURIComponent(url.toString());
  const replacedUrl = decodedUrl.replace(/&amp;/g, "&");
  const parsedUrl = new URL(replacedUrl);

  const github_username =
    url.searchParams.get("github_username") || "Not a user";
  const content = parsedUrl.searchParams.get("content") || "Contributor";
  const pr_opened = parsedUrl.searchParams.get("pr_opened") || "0";
  const pr_reviewed = parsedUrl.searchParams.get("pr_reviewed") || "0";
  const eod_update = parsedUrl.searchParams.get("eod_update") || "0";

  const logoImageData = await fetch(
    new URL("../../../public/logo.jpg", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const profileImage = `https://avatars.githubusercontent.com/${github_username}`;

  const fontData = await fetch(
    new URL("/Roboto-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-wrap bg-white border-b-[30px] border-solid border-purple-600">
        <div tw="relative flex">
          <img
            tw="m-8 h-52 w-52 rounded-full"
            src={profileImage}
            alt={github_username}
          />
          <div tw="ml-2 flex w-[70%] flex-col">
            <div tw="mt-8 flex h-1/2 flex-col">
              <h2 tw="text-3xl">{github_username}</h2>
              <p tw="text-2xl">{content}</p>
            </div>
            <div tw="mt-12 flex text-3xl">
              <div tw="flex flex-col items-center justify-center">
                <GoGitPullRequest size={30} />
                <span tw="my-4">Pull Request</span>
                <span>{pr_opened}</span>
              </div>
              <div tw="mx-20 flex flex-col items-center justify-center">
                <GoCodeReview size={30} />
                <span tw="my-4">Reviews</span>
                <span>{pr_reviewed}</span>
              </div>
              <div tw="flex flex-col items-center justify-center">
                <MdUpdate size={30} />
                <span tw="my-4">Feed Updates</span>
                <span>{eod_update}</span>
              </div>
            </div>
            <img
              style={{
                position: "absolute",
                right: 0,
                top: "10px",
                filter: "invert(100%) brightness(100%)",
              }}
              src={logoImageData}
              alt="organization_logo"
              width={180}
              height={60}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 500,
      fonts: [
        {
          name: "Roboto",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );
}
