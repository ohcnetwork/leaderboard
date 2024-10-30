import { ProcessData } from "./types.js";
import { mkdir } from "fs/promises";
import { loadUserData, saveUserData } from "./utils.js";

const deduplicate = <T>(hash: (value: T) => string, arr: T[]) => {
  return Object.values(
    Object.fromEntries(arr.map((item) => [hash(item), item])),
  );
};

export const mergedData = async (
  dataDir: string,
  processedData: ProcessData,
) => {
  console.log("Updating data");
  await mkdir(dataDir, { recursive: true });

  for (const user in processedData) {
    if (processedData.hasOwnProperty(user)) {
      console.log(`Merging user data for ${user}`);

      const userData = processedData[user];
      const existing = await loadUserData(user, dataDir);
      const combinedActivities = [...userData.activity, ...existing.activity];

      userData.activity = deduplicate((activity) => {
        if (activity.type === "pr_reviewed") {
          return `${activity.type}--${activity.title}`;
        }
        return `${activity.type}--${activity.link}`;
      }, combinedActivities);

      saveUserData(user, userData, dataDir, null);
    }
  }
};
