import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const ROW_ID = 1;

/**
 * Хранение кейсов в SQLite (файл на томе Docker — не затирается при пересборке образа).
 * Одна строка: полный JSON { cases, landingServices } (как раньше cases.json).
 */
export function createCasesStore(dataDir) {
  const dbPath = path.join(dataDir, "relaylend.db");
  const jsonLegacy = path.join(dataDir, "cases.json");

  fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases_payload (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const existing = db
    .prepare("SELECT json FROM cases_payload WHERE id = ?")
    .get(ROW_ID);
  if (!existing && fs.existsSync(jsonLegacy)) {
    try {
      const raw = fs.readFileSync(jsonLegacy, "utf8");
      JSON.parse(raw);
      db.prepare(
        "INSERT INTO cases_payload (id, json, updated_at) VALUES (?, ?, ?)",
      ).run(ROW_ID, raw, Date.now());
      const bak = `${jsonLegacy}.migrated.${Date.now()}`;
      fs.renameSync(jsonLegacy, bak);
      console.log(
        `[relaylend-server] Миграция: cases.json → relaylend.db (резерв: ${path.basename(bak)})`,
      );
    } catch (e) {
      console.warn(
        "[relaylend-server] Миграция cases.json пропущена:",
        e?.message || e,
      );
    }
  }

  return {
    dbPath,
    read() {
      const row = db
        .prepare("SELECT json FROM cases_payload WHERE id = ?")
        .get(ROW_ID);
      if (!row?.json) return null;
      try {
        return JSON.parse(row.json);
      } catch {
        return null;
      }
    },
    write(data) {
      const json = JSON.stringify(data, null, 2);
      db
        .prepare(
          "INSERT OR REPLACE INTO cases_payload (id, json, updated_at) VALUES (?, ?, ?)",
        )
        .run(ROW_ID, json, Date.now());
    },
    close() {
      db.close();
    },
  };
}
