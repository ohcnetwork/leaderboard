/* eslint-disable @next/next/no-img-element */
export default function GraduateAttributeBadge({ skill, color }) {
  return (
    <div
      className={`flex items-center text-white rounded-md ${
        skill.currentLevel ? color : "bg-gray-600"
      }`}
    >
      <div className={`flex flex-shrink-0 items-center justify-center text-white rounded-l-md px-1.5 py-1 mr-1 ${
        skill.currentLevel ? color : "bg-gray-600"
      }`}>
      <img
        className={`w-8 md:w-11 h-8 md:h-11 ${
          skill.currentLevel ? "" : "grayscale opacity-30"
        }`}
        src={skill.icon}
        alt="Graduate attribute"
      /></div>
      <div className="py-1 pr-3">
      {skill.currentLevel && (
        <span className="text-white mr-2">{skill.currentLevel.label}</span>
      )}
      {skill.label}
      </div>
    </div>
  );
}
