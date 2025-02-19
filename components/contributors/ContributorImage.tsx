import Image from "next/image";

interface ContributorImageProps {
  contributorGithub: string;
  rank: number | null;
  size: "small" | "medium" | "large";
  className?: string;
}

const sizes = {
  small: { height: 30, width: 30 },
  medium: { height: 50, width: 50 },
  large: { height: 100, width: 100 },
};

const ContributorImage = ({
  contributorGithub,
  rank,
  size,
  className = "",
}: ContributorImageProps) => {
  const { height, width } = sizes[size];
  function topContributorClasses(rank: number | null): string {
    if (!rank || rank > 3) {
      return "border-4 border-purple-500";
    }
    const rankColors = [
      "text-yellow-600 border-yellow-500 bg-yellow-100",
      "text-stone-600 border-gray-500 bg-gray-200",
      "text-amber-700 border-amber-700 bg-amber-100",
    ];
    return `border-4 ${rankColors[rank - 1]} animate-circular-shadow`;
  }

  return (
    <div
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${topContributorClasses(
        rank,
      )} ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Image
        src={`https://avatars.githubusercontent.com/${contributorGithub}`}
        alt={`Contributor ${contributorGithub}`}
        width={width}
        height={height}
        className="rounded-full object-cover"
      />
      {rank && rank <= 3 && (
        <div className="absolute inset-0 rounded-full bg-black opacity-10"></div>
      )}
    </div>
  );
};

export default ContributorImage;
