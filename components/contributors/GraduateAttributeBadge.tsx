import Image from "next/image";
import BadgeIcons from "./BadgeIcons";

export default function GraduateAttributeBadge({
  skill,
  color,
  colorDark,
}: {
  skill: any;
  color: string;
  colorDark: string;
}) {
  return (
    <div
      className={`flex rounded-md text-white ${
        skill.currentLevel ? color : "bg-secondary-600 opacity-50"
      }`}
    >
      <div
        className={`mr-1 flex shrink-0 items-center justify-center rounded-l-md text-white ${
          skill.currentLevel ? color : "bg-secondary-600"
        }`}
      >
        <div
          className={`relative flex h-full items-center rounded-l-md px-1.5 py-1 ${
            skill.currentLevel ? colorDark : "bg-secondary-700"
          }`}
        >
          <BadgeIcons skill={skill} />
        </div>
      </div>
      <div className="relative flex items-center px-2 py-1">
        <p>{skill.label}</p>
      </div>
    </div>
  );
}
