import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? "/tmp/data" : path.resolve(__dirname, "../data");
const dbPath = path.join(dataDir, "startup-impact.db");

fs.mkdirSync(dataDir, { recursive: true });

if (isVercel && !fs.existsSync(dbPath)) {
  const seedDb = path.resolve(__dirname, "../data/startup-impact.db");
  if (fs.existsSync(seedDb)) {
    fs.copyFileSync(seedDb, dbPath);
  }
}

export const db = new Database(dbPath);
db.pragma("journal_mode=WAL");
db.pragma("foreign_keys=ON");

const migrationsDir = path.resolve(__dirname, "../database/migrations");
for (const file of ["001_initial.sql", "002_reporting_views.sql"]) {
  const migrationPath = path.join(migrationsDir, file);
  if (fs.existsSync(migrationPath)) db.exec(fs.readFileSync(migrationPath, "utf8"));
}

function ensureColumn(table, column, definition) {
  const exists = db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === column);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

ensureColumn("universities", "website_url", "TEXT NOT NULL DEFAULT ''");
ensureColumn("universities", "hero_image_url", "TEXT NOT NULL DEFAULT ''");
ensureColumn("submissions", "updated_at", "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");

const finalMigration = path.join(migrationsDir, "003_finalization.sql");
if (fs.existsSync(finalMigration)) db.exec(fs.readFileSync(finalMigration, "utf8"));
export function tx(fn){return db.transaction(fn)();}
export function audit(userId,startupId,action,before,after,ip=""){db.prepare(
"INSERT INTO audit_log(user_id,startup_id,action,before_json,after_json,ip) VALUES(?,?,?,?,?,?)"
).run(userId||null,startupId||null,action,JSON.stringify(before||{}),JSON.stringify(after||{}),ip);}
