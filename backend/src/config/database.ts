import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { Account, Rep, Deal, Activity, Target } from "../types";

const DATA_PATH =
  process.env.DATA_PATH || path.join(__dirname, "../../..", "data");
const DB_PATH =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "../..", "data", "revenue.db");

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
  }
  return db;
}

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
  const database = getDatabase();

  // Create tables
  database.exec(`
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS deals;
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS reps;
    DROP TABLE IF EXISTS targets;

    CREATE TABLE accounts (
      account_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT,
      segment TEXT
    );

    CREATE TABLE reps (
      rep_id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE deals (
      deal_id TEXT PRIMARY KEY,
      account_id TEXT,
      rep_id TEXT,
      stage TEXT,
      amount REAL,
      created_at TEXT,
      closed_at TEXT,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id),
      FOREIGN KEY (rep_id) REFERENCES reps(rep_id)
    );

    CREATE TABLE activities (
      activity_id TEXT PRIMARY KEY,
      deal_id TEXT,
      type TEXT,
      timestamp TEXT,
      FOREIGN KEY (deal_id) REFERENCES deals(deal_id)
    );

    CREATE TABLE targets (
      month TEXT PRIMARY KEY,
      target REAL
    );

    CREATE INDEX idx_deals_stage ON deals(stage);
    CREATE INDEX idx_deals_account ON deals(account_id);
    CREATE INDEX idx_deals_rep ON deals(rep_id);
    CREATE INDEX idx_deals_created ON deals(created_at);
    CREATE INDEX idx_deals_closed ON deals(closed_at);
    CREATE INDEX idx_activities_deal ON activities(deal_id);
    CREATE INDEX idx_activities_timestamp ON activities(timestamp);
  `);

  // Load and insert data
  const accounts = loadJsonFile<Account>("accounts.json");
  const reps = loadJsonFile<Rep>("reps.json");
  const deals = loadJsonFile<Deal>("deals.json");
  const activities = loadJsonFile<Activity>("activities.json");
  const targets = loadJsonFile<Target>("targets.json");

  // Insert accounts
  const insertAccount = database.prepare(
    "INSERT OR REPLACE INTO accounts (account_id, name, industry, segment) VALUES (?, ?, ?, ?)",
  );
  for (const account of accounts) {
    insertAccount.run(
      account.account_id,
      account.name,
      account.industry,
      account.segment,
    );
  }
  console.log(`✅ Loaded ${accounts.length} accounts`);

  // Insert reps
  const insertRep = database.prepare(
    "INSERT OR REPLACE INTO reps (rep_id, name) VALUES (?, ?)",
  );
  for (const rep of reps) {
    insertRep.run(rep.rep_id, rep.name);
  }
  console.log(`✅ Loaded ${reps.length} reps`);

  // Insert deals
  const insertDeal = database.prepare(
    "INSERT OR REPLACE INTO deals (deal_id, account_id, rep_id, stage, amount, created_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  for (const deal of deals) {
    insertDeal.run(
      deal.deal_id,
      deal.account_id,
      deal.rep_id,
      deal.stage,
      deal.amount,
      deal.created_at,
      deal.closed_at,
    );
  }
  console.log(`✅ Loaded ${deals.length} deals`);

  // Insert activities
  const insertActivity = database.prepare(
    "INSERT OR REPLACE INTO activities (activity_id, deal_id, type, timestamp) VALUES (?, ?, ?, ?)",
  );
  for (const activity of activities) {
    insertActivity.run(
      activity.activity_id,
      activity.deal_id,
      activity.type,
      activity.timestamp,
    );
  }
  console.log(`✅ Loaded ${activities.length} activities`);

  // Insert targets
  const insertTarget = database.prepare(
    "INSERT OR REPLACE INTO targets (month, target) VALUES (?, ?)",
  );
  for (const target of targets) {
    insertTarget.run(target.month, target.target);
  }
  console.log(`✅ Loaded ${targets.length} targets`);
}

export default getDatabase;
