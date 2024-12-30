import {
  advancedSkills,
  GraduateAttribute,
  humanValues,
  professionalSelfSkills,
  professionalTeamSkills,
} from "@/config/GraduateAttributes";
import Image from "next/image";

const skills = [
  {
    title: "Professional Individual Skills",
    attributes: professionalSelfSkills,
  },
  {
    title: "Professional Team Skills",
    attributes: professionalTeamSkills,
  },
  {
    title: "Advanced Skills",
    attributes: advancedSkills,
  },
  {
    title: "Cultural Skills",
    attributes: humanValues,
  },
];

export default function GraduateAttributesPage() {
  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="mb-12 text-center text-4xl font-bold">
        Graduate Attributes
      </h1>

      {skills.map((skillCategory) => (
        <section key={skillCategory.title} className="mb-16">
          <h2 className="mb-8 text-3xl font-semibold">{skillCategory.title}</h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {skillCategory.attributes.map((attribute: GraduateAttribute) => (
              <div
                key={attribute.key}
                className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg"
              >
                <Image
                  src={attribute.icon}
                  alt={attribute.label}
                  width={80}
                  height={80}
                  className="mb-6"
                />
                <h3 className="mb-4 text-2xl font-medium">{attribute.label}</h3>
                {attribute.levels.length > 0 ? (
                  <ul className="text-center">
                    {attribute.levels.map((level) => (
                      <li
                        key={level.label}
                        className="mb-2 flex flex-col items-center text-lg"
                      >
                        <span className="text-xl font-semibold">
                          {level.label}
                        </span>
                        <p className="text-gray-600">{level.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-500">
                    No levels defined yet..
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
