import Image from "next/image";
import { getBase64Url } from "@/lib/plaiceholder";

interface ContributorImageProps {
  contributorGithub: string;
  rank: number | null;
  height: number;
  width: number;
}

export default async function ContributorImage({
  contributorGithub,
  rank,
  height,
  width,
}: ContributorImageProps) {
  const contributorRankClasses = (rank: number | null): string => {
    if (!rank || rank > 3) {
      return "text-purple-500";
    }
    const rankColor = ["text-yellow-600", "text-stone-600", "text-amber-700"][
      rank - 1
    ];
    return `${rankColor} animate-circular-shadow`;
  };

  const base64Url = await getBase64Url(
    `https://avatars.githubusercontent.com/${contributorGithub}`,
  );

  return (
    <div
      className={`dark:border-1 shrink-0 rounded-full border-2 border-current ${contributorRankClasses(rank)}`}
    >
      <Image
        loading="lazy"
        className="rounded-full"
        placeholder="blur"
        blurDataURL={base64Url}
        src={`https://avatars.githubusercontent.com/${contributorGithub}`}
        alt={contributorGithub}
        height={height}
        width={width}
      />
    </div>
  );
}
