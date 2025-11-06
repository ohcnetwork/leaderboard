import { PGlite } from "@electric-sql/pglite";

function getPgLiteClient() {
  return new PGlite("./db-data");
}

export const db = getPgLiteClient();
