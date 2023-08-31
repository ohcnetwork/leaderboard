/* eslint-disable @next/next/no-img-element */
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
      className={`flex text-white rounded-md ${
        skill.currentLevel ? color : "bg-gray-600 opacity-50"
      }`}
    >
      <div
        className={`flex flex-shrink-0 items-center justify-center text-white rounded-l-md mr-1 ${
          skill.currentLevel ? color : "bg-gray-600"
        }`}
      >
        <div
          className={`flex relative items-center h-full rounded-l-md px-1.5 py-1 ${
            skill.currentLevel ? colorDark : "bg-gray-700"
          }`}
        >
          <img
            className={`w-8 md:w-11 h-8 md:h-11 ${
              skill.currentLevel ? "" : "grayscale opacity-30"
            }`}
            src={skill.icon}
            alt="Graduate attribute"
          />
          {skill.currentLevel && (
            <span className="absolute right-0 bottom-0 text-sm font-medium px-1 text-gray-900 bg-gray-100 rounded leading-tight">
              {skill.currentLevel.label}
            </span>
          )}
        </div>
      </div>
      <div className="py-1 px-2 relative flex items-center">
        <p>{skill.label}</p>
      </div>
    </div>
  );
}
