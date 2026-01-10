import { homedir } from "os";
import path from "path";

/**
 * Absolute path to the data directory based on the environment variable
 * `LEADERBOARD_DATA_DIR` or the provided data directory or fallback to `./data`
 * relative to the workspace root
 * @param dataDir - The data directory to use, if not provided, the environment
 * variable `LEADERBOARD_DATA_DIR` will be used
 * @returns The absolute path to the data directory
 */
export const getDataDir = (dataDir?: string) => {
  const workspaceRoot = process.env.WORKSPACE_ROOT;
  if (!workspaceRoot) {
    throw new Error("'WORKSPACE_ROOT' is not set in the environment");
  }

  const raw = dataDir || process.env.LEADERBOARD_DATA_DIR;
  if (!raw) {
    return path.resolve(workspaceRoot, "./data");
  }

  let p = raw;

  // Expand ~
  if (p.startsWith("~")) {
    p = path.join(homedir(), p.slice(1));
  }

  // Absolute path → normalize and return
  if (path.isAbsolute(p)) {
    return path.resolve(p);
  }

  // Relative path → resolve against workspace root
  return path.resolve(workspaceRoot, p);
};

/**
 * Absolute path to the data directory based on the environment variable
 * `LEADERBOARD_DATA_DIR` or fallback to `./data` relative to the workspace root
 */
export const dataDir = getDataDir();
