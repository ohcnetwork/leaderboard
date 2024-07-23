import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";
import fs from "fs";
import { describe, it } from "node:test";
import path, { join } from "path";
import stripJsonComments from "strip-json-comments";
import yaml from "yaml";

const cwd = process.cwd();

const SCHEMA_FILE = join(cwd, "schemas/discussion-data.yaml");
const GH_DATA = join(
  cwd,
  process.env.DATA_REPO ?? "data-repo",
  "data/github/discussions",
);

const schema = await yaml.parse(fs.readFileSync(SCHEMA_FILE).toString());

use(chaiJsonSchema);

if (!fs.existsSync(GH_DATA)) {
  console.log(
    `Directory ${GH_DATA} does not exist. Skipping discussions test.`,
  );
  process.exit(0);
}

const filesInDir = fs
  .readdirSync(GH_DATA)
  .filter((file) => path.extname(file) === ".json");

filesInDir.forEach((file) => {
  const content = fs.readFileSync(join(GH_DATA, file)).toString();
  const data = JSON.parse(stripJsonComments(content));

  describe(`Validate '${file}'`, function () {
    it("should be properly validated by the json schema", () => {
      expect(data).to.be.jsonSchema(schema);
    });
  });
});
