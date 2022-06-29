export let professionalSelfSkills = [
  {
    key: "creative_thinking",
    label: "Creative thinking",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 2,
        description: "2 Issues Created",
      },
      {
        label: "2x",
        value: 16,
        description: "16 Issues Created",
      },
      {
        label: "3x",
        value: 128,
        description: "128 Issues Created",
      },
      {
        label: "4x",
        value: 1024,
        description: "1024 Issues Created",
      },
    ],
  },
  {
    key: "problem_solving",
    label: "Problem Solving",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 2,
        description: "2 Pulls Created",
      },
      {
        label: "2x",
        value: 16,
        description: "16 Pulls Created",
      },
      {
        label: "3x",
        value: 128,
        description: "128 Pulls Created",
      },
      {
        label: "4x",
        value: 1024,
        description: "1024 Pulls Created",
      },
    ],
  },
  {
    key: "practical_professional_skills",
    label: "Practical/Professional Skills",
    icon: "/images/sample-badge.svg",
    levels: [],
  },
];

export let professionalTeamSkills = [
  {
    key: "communication_skills",
    label: "Communication Skills",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 100,
        description: "100th Community Interaction",
      },
      {
        label: "2x",
        value: 1000,
        description: "1000th Community Interaction",
      },
      {
        label: "3x",
        value: 10000,
        description: "10000th Community Interaction",
      },
    ],
  },
  {
    key: "collaboration",
    label: "Collaboration",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 2,
        description: "2 Pulls Created",
      },
      {
        label: "2x",
        value: 16,
        description: "16 Pulls Created",
      },
      {
        label: "3x",
        value: 128,
        description: "128 Pulls Created",
      },
      {
        label: "4x",
        value: 1024,
        description: "1024 Pulls Created",
      },
    ],
  },
  {
    key: "community_engagement",
    label: "Community Engagement",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 100,
        description: "100 Activity Points",
      },
      {
        label: "2x",
        value: 1000,
        description: "1000 Activity Points",
      },
      {
        label: "3x",
        value: 10000,
        description: "10000 Activity Points",
      },
    ],
  },
];

export let advancedSkills = [
  {
    key: "leadership",
    label: "Leadership",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 1,
        description: "Promoted to a team leader",
      },
    ],
  },
  {
    key: "learn_how_to_learn",
    label: "Learn How to Learn",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 1,
        description: "Completed the course work",
      },
    ],
  },
  {
    key: "skills_to_apply_dt_solutions",
    label: "Skills to apply digital & technology solutions",
    icon: "/images/sample-badge.svg",
    levels: [
      {
        label: "1x",
        value: 1,
        description: "1 Project Completed Successfully",
      },
      {
        label: "2x",
        value: 2,
        description: "2 Projects Completed Successfully",
      },
      {
        label: "3x",
        value: 3,
        description: "3 Projects Completed Successfully",
      },
    ],
  },
];

export let humanValues = [
  {
    key: "autonomy_and_responsibility",
    label: "Autonomy And Responsibility",
    icon: "/images/sample-badge.svg",
    levels: [],
  },
  {
    key: "empathy",
    label: "Empathy",
    icon: "/images/sample-badge.svg",
    levels: [],
  },
  {
    key: "multicultural_competence",
    label: "Multicultural Competence",
    icon: "/images/sample-badge.svg",
    levels: [],
  },
  {
    key: "value_inculcation",
    label: "Value inculcation",
    icon: "/images/sample-badge.svg",
    levels: [],
  },
];

let resolveLevel = (attribute, value) => {
  let level = undefined;

  attribute.levels.map((l) => {
    if (value >= l.value) {
      level = l;
    }
  });

  if (level) {
    return { ...attribute, currentLevel: level };
  } else {
    return attribute;
  }
};

export let resolveGraduateAttributes = (attribute, contributor) => {
  console.log(contributor);
  switch (attribute.key) {
    case "creative_thinking":
      return resolveLevel(attribute, contributor.highlights.issue_opened);
    case "problem_solving":
      return resolveLevel(attribute, contributor.highlights.pr_merged);
    case "communication_skills":
      return resolveLevel(
        attribute,
        contributor.highlights.comment_created +
          contributor.highlights.eod_update
      );
    case "community_engagement":
      return resolveLevel(attribute, contributor.highlights.points);
    case "leadership":
      return resolveLevel(attribute, contributor.leadership?.length);
    case "learn_how_to_learn":
      return resolveLevel(attribute, contributor.courses_completed?.length);
    case "skills_to_apply_dt_solutions":
      return resolveLevel(attribute, contributor.courses_completed?.length);
    default:
      return { ...attribute };
  }
};
