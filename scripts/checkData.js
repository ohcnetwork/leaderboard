const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const dataRepoDir = "data-repo";

const askYN = (question, def, ycallback, ncallback) => {
  console.log(`${question} (${def ? "Y/n" : "y/N"})`);
  const stdin = process.openStdin();
  stdin.addListener("data", function (d) {
    const input = d.toString().trim().toLowerCase();
    stdin.removeAllListeners("data");
    if (input === "y" || (!input && def)) {
      ycallback();
    } else if (input === "n" || (!input && !def)) {
      ncallback();
    } else {
      askYN(question, def, ycallback, ncallback);
    }
  });
};
if (!fs.existsSync(path.join(process.cwd(), dataRepoDir))) {
  console.log("Looks like you have not loaded any data.");
  askYN(
    "Download data now?",
    true,
    () => {
      execSync(`node scripts/loadOrgData.js`, { stdio: "inherit" });
      process.exit(0);
    },
    () => {
      console.log("Aborting...");
      process.exit(1);
    },
  );
}
