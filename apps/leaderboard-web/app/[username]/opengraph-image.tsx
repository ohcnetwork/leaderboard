import { ImageResponse } from "next/og";
import { getContributorProfile, getAllContributorUsernames } from "@/lib/data/loader";
import { getConfig } from "@/lib/config/get-config";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Contributor Profile";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export async function generateStaticParams() {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username) => ({ username }));
}

interface Props {
  params: Promise<{ username: string }>;
}

export default async function Image({ params }: Props) {
  const { username } = await params;
  const { contributor, totalPoints, activityByDate } =
    await getContributorProfile(username);
  const config = getConfig();

  if (!contributor) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Contributor not found
        </div>
      ),
      { ...size }
    );
  }

  // Calculate activity breakdown
  const activities = Object.values(activityByDate).reduce(
    (sum, count) => sum + count,
    0
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #1e293b, #0f172a)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Avatar Container */}
        <div
          style={{
            display: "flex",
            marginBottom: "40px",
          }}
        >
          {contributor.avatar_url ? (
            <img
              src={contributor.avatar_url}
              alt={contributor.name || contributor.username}
              width={180}
              height={180}
              style={{
                borderRadius: "50%",
                border: "6px solid #3b82f6",
              }}
            />
          ) : (
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
                fontWeight: "bold",
                color: "white",
                border: "6px solid #60a5fa",
              }}
            >
              {(contributor.name || contributor.username)
                .substring(0, 2)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "16px",
            textAlign: "center",
            display: "flex",
          }}
        >
          {contributor.name || contributor.username}
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "32px",
            color: "#94a3b8",
            marginBottom: "48px",
            display: "flex",
          }}
        >
          @{contributor.username}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "60px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#3b82f6",
                textAlign: "center",
                display: "flex",
              }}
            >
              {totalPoints}
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#94a3b8",
                textAlign: "center",
                display: "flex",
              }}
            >
              Total Points
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#3b82f6",
                textAlign: "center",
                display: "flex",
              }}
            >
              {activities}
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#94a3b8",
                textAlign: "center",
                display: "flex",
              }}
            >
              Activities
            </div>
          </div>
        </div>

        {/* Organization */}
        <div
          style={{
            fontSize: "24px",
            color: "#64748b",
            display: "flex",
            flexDirection: "row",
            gap: "12px",
          }}
        >
          <span>{config.org.name}</span>
          <span>•</span>
          <span>Contributor Leaderboard</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
