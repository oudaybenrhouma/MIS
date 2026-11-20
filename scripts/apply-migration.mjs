import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const filename = process.argv[2];
if (!filename || !/^\d{3}_[a-z0-9_-]+\.sql$/.test(filename)) {
  throw new Error("Pass a numbered SQL migration filename, for example 002_product_offers.sql");
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set for the target environment.");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(path.join(root, "database/migrations", filename), "utf8");
const statements = source.split(/;\s*(?=\n|$)/).map((sql) => sql.trim()).filter(Boolean);
const sql = neon(connectionString);
for (const statement of statements) await sql.query(statement, []);
console.log(`Applied ${filename} (${statements.length} statements).`);
