/**
 * Migration to remove duplicate activities from the users data.
 */

const fs = require("fs");
const path = require("path");

function removeDuplicates(data) {
  const uniqueActivities = [];
  const seenActivities = new Set();

  data.activity.forEach((activity) => {
    const activityKey = JSON.stringify(activity);

    if (!seenActivities.has(activityKey)) {
      uniqueActivities.push(activity);
      seenActivities.add(activityKey);
    }
  });

  data.activity = uniqueActivities;
  return JSON.stringify(data, null, 2);
}

function main() {
  const dir = path.join(__dirname, "../../data-repo/data/github");
  fs.readdir(dir, function (err, files) {
    if (err) {
      return console.log(err);
    }

    files.forEach((file) => {
      const file_to_update = path.join(dir, file);

      fs.readFile(file_to_update, "utf8", function (err, data) {
        if (err) {
          return console.log(err);
        }
        const updatedData = removeDuplicates(JSON.parse(data));
        fs.writeFile(file_to_update, updatedData, function (err) {
          if (err) {
            return console.log(err);
          }

          console.log(`Updated ${file}`);
        });
      });
    });
  });
}

main();
