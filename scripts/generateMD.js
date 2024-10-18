var fs = require("fs");

const profiles = [
  {
    name: "place name here",
    github: "place github id here",
    slack: "place slack id here",
  },
];

const generateContent = (name, github, slack) => {
  return `---
name: ${name}
title: Intern
github: ${github}
twitter: ${github}
linkedin: ${github}
slack: ${slack}
joining_date: "15/10/2024"
role: intern
---

Still waiting for this
`;
};

for (const { name, github, slack } of profiles) {
  const content = generateContent(name, github, slack);
  fs.writeFile(`${github}.md`, content, (err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  });
}
