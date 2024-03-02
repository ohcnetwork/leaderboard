import Image from "next/image";

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
          <Image
            className={`h-8 w-8 md:h-11 md:w-11 ${
              skill.currentLevel ? "" : "opacity-30 grayscale"
            }`}
            height={32}
            width={32}
            src={skill.icon}
            alt="Graduate attribute"
          />
          {skill.currentLevel && (
            <span className="absolute bottom-0 right-0 rounded bg-secondary-100 px-1 text-sm font-medium leading-tight text-secondary-900">
              {skill.currentLevel.label}
            </span>
          )}
        </div>
      </div>
      <div className="relative flex items-center px-2 py-1">
        <p>{skill.label}</p>
      </div>
    </div>
  );
}
