/* eslint-disable @next/next/no-img-element */
export default function GraduateAttributeBadge({ skill, color }) {
  return (
    <div
      className={`flex text-white px-4 p-2 rounded-md ${
        skill.currentLevel ? color : "bg-gray-500"
      }`}
    >
      <img
        className={`w-6 h-6 mr-2 ${
          skill.currentLevel ? "" : "grayscale opacity-30"
        }`}
        src={skill.icon}
        alt="Graduate attribute"
      />
      {skill.currentLevel && (
        <span className="text-white mr-2">{skill.currentLevel.label}</span>
      )}
      {skill.label}
    </div>
  );
}
