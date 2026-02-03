import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs";
import { Account, Rep, Deal, Activity, Target } from "../types";

const DATA_PATH =
  process.env.DATA_PATH || path.join(__dirname, "../../..", "data");

let db: Database | null = null;

function loadJsonFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_PATH, filename);
  console.log(`Loading ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T[];
}

export async function initializeDatabase(): Promise<void> {
  const SQL = await initSqlJs();
  db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      account_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,
      segment TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reps (
      rep_id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deals (
      deal_id TEXT PRIMARY KEY,
      account_id TEXT,
      rep_id TEXT,
      stage TEXT,
      amount REAL,
      created_at TEXT,
      closed_at TEXT,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id),
      FOREIGN KEY (rep_id) REFERENCES reps(rep_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      activity_id TEXT PRIMARY KEY,
      deal_id TEXT,
      type TEXT,
      timestamp TEXT,
      FOREIGN KEY (deal_id) REFERENCES deals(deal_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS targets (
      month TEXT PRIMARY KEY,
      target REAL
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deals_account ON deals(account_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deals_rep ON deals(rep_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deals_created ON deals(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deals_closed ON deals(closed_at)`);
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp)`,
  );

  // Load and insert data
  const accounts = loadJsonFile<Account>("accounts.json");
  const reps = loadJsonFile<Rep>("reps.json");
  const deals = loadJsonFile<Deal>("deals.json");
  const activities = loadJsonFile<Activity>("activities.json");
  const targets = loadJsonFile<Target>("targets.json");

  // Insert accounts
  const insertAccount = db.prepare(
    "INSERT OR REPLACE INTO accounts (account_id, name, industry, segment) VALUES (?, ?, ?, ?)",
  );
  for (const account of accounts) {
    insertAccount.run([
      account.account_id,
      account.name,
      account.industry,
      account.segment,
    ]);
  }
  insertAccount.free();
  console.log(`✅ Loaded ${accounts.length} accounts`);

  // Insert reps
  const insertRep = db.prepare(
    "INSERT OR REPLACE INTO reps (rep_id, name) VALUES (?, ?)",
  );
  for (const rep of reps) {
    insertRep.run([rep.rep_id, rep.name]);
  }
  insertRep.free();
  console.log(`✅ Loaded ${reps.length} reps`);

  // Insert deals
  const insertDeal = db.prepare(
    "INSERT OR REPLACE INTO deals (deal_id, account_id, rep_id, stage, amount, created_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  for (const deal of deals) {
    insertDeal.run([
      deal.deal_id,
      deal.account_id,
      deal.rep_id,
      deal.stage,
      deal.amount,
      deal.created_at,
      deal.closed_at,
    ]);
  }
  insertDeal.free();
  console.log(`✅ Loaded ${deals.length} deals`);

  // Insert activities
  const insertActivity = db.prepare(
    "INSERT OR REPLACE INTO activities (activity_id, deal_id, type, timestamp) VALUES (?, ?, ?, ?)",
  );
  for (const activity of activities) {
    insertActivity.run([
      activity.activity_id,
      activity.deal_id,
      activity.type,
      activity.timestamp,
    ]);
  }
  insertActivity.free();
  console.log(`✅ Loaded ${activities.length} activities`);

  // Insert targets
  const insertTarget = db.prepare(
    "INSERT OR REPLACE INTO targets (month, target) VALUES (?, ?)",
  );
  for (const target of targets) {
    insertTarget.run([target.month, target.target]);
  }
  insertTarget.free();
  console.log(`✅ Loaded ${targets.length} targets`);
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return db;
}

// Helper function to convert sql.js result to array of objects
export function queryAll<T>(sql: string, params: any[] = []): T[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T>(sql: string, params: any[] = []): T | undefined {
  const results = queryAll<T>(sql, params);
  return results[0];
}

export default getDatabase;
