let fs = require("fs");

function generateContent(name, github) {
  return `---
name: ${name}
title: Contributor
github: ${github}
twitter: ""
linkedin: ""
slack: ""
joining_date: ""
core: false
intern: false
operations: false
---

Still waiting for this
`;
}

function getNewContributors() {
  let newContributors = new Set();

  fs.readdirSync("./data/github").forEach((file) => {
    newContributors.add(file.split(".")[0]);
  });

  fs.readdirSync("./contributors").forEach((file) => {
    newContributors.delete(file.split(".")[0]);
  });

  return newContributors;
}

function main() {
  let token = process.env.GITHUB_TOKEN;
  let headers = {};
  if (token !== undefined) {
    headers = {
      Authorization: `token ${token}`,
    };
  }

  let newContributors = getNewContributors();
  console.log(newContributors);

  newContributors.forEach(async (value) => {
    // fetch the user data from the github api
    fetch(`https://api.github.com/users/${value}`, { headers })
      .then(async (res) => {
        if (res.status === 404) throw new Error("User not found");
        if (res.status !== 200)
          throw new Error("Error fetching data" + (await res.text()));
        return res.json();
      })
      .then((data) => {
        if (data.name === null) data.name = data.login;
        fs.writeFile(
          `./contributors/${data.login}.md`,
          generateContent(data.name, data.login),
          (err) => {
            if (err) throw err;
            console.log("The file was saved!");
          },
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

main();
