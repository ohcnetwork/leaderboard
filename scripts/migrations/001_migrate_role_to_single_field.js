/**
 * Migration to migrate multiple fields in contributors markdown that represents
 * role to a single field.
 */

var fs = require("fs");
var path = require("path");

function main() {
  var contributorsDir = path.join(__dirname, "../data-repo/contributors");
  var testDir = path.join(__dirname, "../data-repo/contributors");

  fs.readdir(contributorsDir, function (err, files) {
    if (err) {
      return console.log(err);
    }

    files.forEach(function (file) {
      var contributorFile = path.join(contributorsDir, file);
      var testFile = path.join(testDir, file);

      fs.readFile(contributorFile, "utf8", function (err, data) {
        if (err) {
          return console.log(err);
        }

        var updatedData = data
          .replace(
            /core: false\s+intern: false\s+operations: false/,
            `role: contributor`,
          )
          .replace(
            /core: true\s+intern: false\s+operations: false/,
            `role: core`,
          )
          .replace(
            /core: false\s+intern: true\s+operations: false/,
            `role: intern`,
          )
          .replace(
            /core: false\s+intern: false\s+operations: true/,
            `role: operations`,
          );

        fs.writeFile(testFile, updatedData, function (err) {
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
