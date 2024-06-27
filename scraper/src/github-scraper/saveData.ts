import { ProcessData } from "./types.js";
import { mkdir } from "fs/promises";
import { loadUserData, saveUserData } from "./utils.js";

export const merged_data = async (
  dataDir: string,
  processedData: ProcessData,
) => {
  console.log("Updating data");
  await mkdir(dataDir, { recursive: true });

  for (let user in processedData) {
    if (processedData.hasOwnProperty(user)) {
      console.log(`Merging user data for ${user}`);
      let oldData = await loadUserData(user, dataDir);
      let userData = processedData[user];
      let newUniqueEvents = [];

      for (let event of userData.activity) {
        if (
          !oldData.activity.some(
            (oldEvent) => JSON.stringify(oldEvent) === JSON.stringify(event),
          )
        ) {
          newUniqueEvents.push(event);
        }
      }

      userData.activity = newUniqueEvents.concat(oldData.activity);
      saveUserData(user, userData, dataDir, null);
    }
  }
};
