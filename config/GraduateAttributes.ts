import { points } from "@/lib/api";
import { Contributor } from "@/lib/types";

export let professionalSelfSkills = [
  {
    key: "creative_thinking",
    label: "Creative thinking",
    icon: "/images/Professional-Skills-Self/Creative-Thinking.svg",
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
    icon: "/images/Professional-Skills-Self/Problem-Solving.svg",
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
    icon: "/images/Professional-Skills-Self/Practical-Professional-Skills.svg",
    levels: [],
  },
];

export let professionalTeamSkills = [
  {
    key: "communication_skills",
    label: "Communication Skills",
    icon: "/images/Professional-Skills-Team/Communication-Skill.svg",
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
    icon: "/images/Professional-Skills-Team/Collaboration.svg",
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
    icon: "/images/Professional-Skills-Team/Community-Engagement.svg",
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
    icon: "/images/Advanced-Skills/Leadership.svg",
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
    icon: "/images/Advanced-Skills/Learn-how-to-learn.svg",
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
    icon: "/images/Advanced-Skills/Skills-to-apply-digital-and-technology-solutions.svg",
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
  {
    key: "critical_thinking",
    label: "Critical Thinking",
    icon: "/images/Advanced-Skills/Critical-Thinking.svg",
    levels: [],
  },
];

export let humanValues = [
  {
    key: "autonomy_and_responsibility",
    label: "Autonomy And Responsibility",
    icon: "/images/Human-Values/Autonomy-and-Responsibility.svg",
    levels: [
      {
        label: "1x",
        value: 2,
        description: "2 issues identified and resolved",
      },
      {
        label: "2x",
        value: 16,
        description: "16 issues identified and resolved",
      },
      {
        label: "3x",
        value: 128,
        description: "128 issues identified and resolved",
      },
      {
        label: "4x",
        value: 1024,
        description: "1024 issues identified and resolved",
      },
    ],
  },
  {
    key: "empathy",
    label: "Empathy",
    icon: "/images/Human-Values/Empathy.svg",
    levels: [
      {
        label: "1x",
        value: 1,
        description: "Resolved 1 Question in the community",
      },
      {
        label: "2x",
        value: 10,
        description: "Resolved 10 Question in the community",
      },
      {
        label: "3x",
        value: 100,
        description: "Resolved 100 Question in the community",
      },
      {
        label: "4x",
        value: 1000,
        description: "Resolved 1000 Question in the community",
      },
    ],
  },
  {
    key: "value_inculcation",
    label: "Value inculcation",
    icon: "/images/Human-Values/Value-Inculcation.svg",
    levels: [],
  },
  {
    key: "multicultural_competence",
    label: "Multicultural Competence",
    icon: "/images/Human-Values/Multicultural-Competence.svg",
    levels: [],
  },
];

export type GraduateAttribute = {
  key: string;
  label: string;
  icon: string;
  levels: {
    label: string;
    value: number;
    description: string;
  }[];
};

let resolveLevel = (attribute: GraduateAttribute, value: number) => {
  return {
    ...attribute,
    currentLevel: value
      ? attribute.levels.reduce((p, v) => (value >= v.value ? v : p))
      : undefined,
  };
};

export let resolveGraduateAttributes = (
  attribute: GraduateAttribute,
  contributor: Contributor,
) => {
  switch (attribute.key) {
    case "creative_thinking":
      return resolveLevel(attribute, contributor.highlights.issue_opened);
    case "problem_solving":
      return resolveLevel(attribute, contributor.highlights.pr_merged);
    case "collaboration":
      return resolveLevel(attribute, contributor.highlights.pr_collaborated);
    case "communication_skills":
      return resolveLevel(
        attribute,
        contributor.highlights.comment_created +
          contributor.highlights.eod_update,
      );
    case "community_engagement":
      return resolveLevel(attribute, contributor.highlights.points);
    case "leadership":
      return resolveLevel(attribute, contributor.leadership?.length ?? 0);
    case "learn_how_to_learn":
      return resolveLevel(attribute, contributor.courses_completed?.length);
    case "skills_to_apply_dt_solutions":
      return resolveLevel(attribute, contributor.courses_completed?.length);
    case "autonomy_and_responsibility":
      return resolveLevel(
        attribute,
        contributor.activityData?.authored_issue_and_pr?.length,
      );
    case "empathy":
      return resolveLevel(
        attribute,
        contributor.highlights.discussion_created / points.discussion_answered,
      );
    default:
      return { ...attribute };
  }
};
