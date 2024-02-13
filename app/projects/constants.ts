// TODO: make this configurable

export type ActiveProjectLabelConfig = Record<
  string,
  { className: string; name: string; ref: string }
>;

export const ACTIVE_PROJECT_LABELS: ActiveProjectLabelConfig = {
  GSoC: {
    className: "text-yellow-500",
    name: "Google Summer of Code",
    ref: "https://summerofcode.withgoogle.com/",
  },
  // C4GT: {
  //   className: "text-blue-500",
  //   name: "Code for GovTech",
  //   ref: "https://www.codeforgovtech.in/",
  // },
};
