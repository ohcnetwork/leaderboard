import ImageWithBlur from "../ImageWithBlur";

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

  return (
    <div
      className={`dark:border-1 shrink-0 rounded-full border-2 border-current ${contributorRankClasses(rank)}`}
    >
      <ImageWithBlur
        imageUrl={`https://avatars.githubusercontent.com/${contributorGithub}`}
        className="rounded-full"
        src={`https://avatars.githubusercontent.com/${contributorGithub}`}
        alt={contributorGithub}
        height={height}
        width={width}
      />
    </div>
  );
}
