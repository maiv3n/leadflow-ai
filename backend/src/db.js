import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../database.sqlite");

// Cria conexão com SQLite
const db = new Database(dbPath, { verbose: console.log });

// Habilita WAL mode para melhor performance
db.pragma("journal_mode = WAL");

export function initDB() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        company TEXT,
        message TEXT,
        score INTEGER DEFAULT 0,
        intent TEXT DEFAULT 'unknown',
        summary TEXT,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    `);

    console.log("✅ Database initialized successfully");
    return db;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

export default db;
