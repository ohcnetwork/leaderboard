/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { GoGitPullRequest } from "react-icons/go";
import { GoCodeReview } from "react-icons/go";
import { MdUpdate } from "react-icons/md";

export const runtime = "edge";

const highlightsStyles = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "1rem",
} as React.CSSProperties;

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
    new URL("../../../public/logo.png", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const profileImage = `https://avatars.githubusercontent.com/${github_username}`;

  const fontData = await fetch(
    new URL("./Roboto-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          borderBottom: "30px solid #976AE2",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", position: "relative" }}>
          <img
            style={{
              borderRadius: "50%",
              margin: "2rem",
              height: "200px",
              width: "200px",
            }}
            src={profileImage}
            alt={github_username}
          />
          <div
            style={{
              marginLeft: "0.5rem",
              display: "flex",
              flexDirection: "column",
              width: "70%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "50%",
                marginTop: "2rem",
              }}
            >
              <h2 style={{ fontSize: 35 }}>{github_username}</h2>
              <p style={{ fontSize: 25 }}>{content}</p>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                gap: "5rem",
                marginTop: "2.5rem",
              }}
            >
              <div style={highlightsStyles}>
                <GoGitPullRequest size={30} />
                <span>Pull Request</span>
                <span>{pr_opened}</span>
              </div>
              <div style={highlightsStyles}>
                <GoCodeReview size={30} />
                <span>Reviews</span>
                <span>{pr_reviewed}</span>
              </div>
              <div style={highlightsStyles}>
                <MdUpdate size={30} />
                <span>Feed Updates</span>
                <span>{eod_update}</span>
              </div>
            </div>
            <img
              style={{
                width: "200px",
                height: "70px",
                position: "absolute",
                top: 10,
                right: -40,
                inset: 0,
              }}
              src={logoImageData}
              alt={"organization_logo"}
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
