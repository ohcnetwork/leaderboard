// TODO: make this configurable

export type ActiveProjectLabelConfig = Record<
  string,
  { className: string; shortName?: string; name: string; ref: string }
>;

export const ACTIVE_PROJECT_LABELS: ActiveProjectLabelConfig = {
  GSoC: {
    className: "text-yellow-500 hover:bg-yellow-500 hover:text-white",
    name: "Google Summer of Code",
    shortName: "GSoC",
    ref: "https://summerofcode.withgoogle.com/",
  },
  // C4GT: {
  //   className: "text-blue-500",
  //   name: "Code for GovTech",
  //   ref: "https://www.codeforgovtech.in/",
  // },
};
