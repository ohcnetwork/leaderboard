const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const DATA_SOURCE = process.env.DATA_SOURCE || null;
if (!DATA_SOURCE) {
  console.error("Please provide a DATA_SOURCE environment variable");
  process.exit(1);
}
const cwd = process.cwd();
const dataRepoPath = path.join(cwd, "data-repo");

function executeCommand(command, workingDir = cwd) {
  try {
    const result = execSync(command, { cwd: workingDir, stdio: "inherit" });
    return result;
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
  }
}

if (fs.existsSync(path.join(dataRepoPath, ".git"))) {
  console.log("Updating existing data repository...");
  const remotes = executeCommand("git remote -v", dataRepoPath);
  if (remotes && remotes.includes("upstream")) {
    executeCommand("git clean -df", dataRepoPath);
    executeCommand("git fetch upstream", dataRepoPath);
    executeCommand("git checkout --force main", dataRepoPath);
    executeCommand("git reset --hard main", dataRepoPath);
    executeCommand("git pull upstream main", dataRepoPath);
  }
} else {
  console.log("Cloning data repository for the first time...");

  fs.rmSync(dataRepoPath, { recursive: true, force: true });
  executeCommand(`git clone --depth=1 ${DATA_SOURCE} ${dataRepoPath}`);
  executeCommand("git remote add upstream " + DATA_SOURCE, dataRepoPath);
  executeCommand("git remote remove origin", dataRepoPath);
  executeCommand("git pull upstream main", dataRepoPath);
}

if (fs.existsSync(path.join(dataRepoPath, "config/assets"))) {
  console.log("Copying assets to public folder...");
  fs.cpSync(
    path.join(dataRepoPath, "config/assets"),
    path.join(cwd, "public"),
    { recursive: true },
  );
}
const additionalFileSrc = path.join(dataRepoPath, "config/opengraph-image.tsx");
const additionalFileDest = path.join(
  cwd,
  "app/contributors/[slug]",
  "opengraph-image.tsx",
);

if (fs.existsSync(additionalFileSrc)) {
  console.log("Copying additional file opengraph-image.tsx...");
  fs.copyFileSync(additionalFileSrc, additionalFileDest);
} else {
  console.error("File opengraph-image.tsx not found in the config folder");
}
