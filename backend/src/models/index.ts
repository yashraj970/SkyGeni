import { getDatabase } from "../config/database";
import { Account, Rep, Deal, Activity, Target } from "../types";

export function getAllAccounts(): Account[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM accounts").all() as Account[];
}

export function getAccountById(id: string): Account | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM accounts WHERE account_id = ?").get(id) as
    | Account
    | undefined;
}

export function getAllReps(): Rep[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM reps").all() as Rep[];
}

export function getRepById(id: string): Rep | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM reps WHERE rep_id = ?").get(id) as
    | Rep
    | undefined;
}

export function getAllDeals(): Deal[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM deals").all() as Deal[];
}

export function getDealsByStage(stage: string): Deal[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM deals WHERE stage = ?").all(stage) as Deal[];
}

export function getDealsByRep(repId: string): Deal[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM deals WHERE rep_id = ?")
    .all(repId) as Deal[];
}

export function getDealsByAccount(accountId: string): Deal[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM deals WHERE account_id = ?")
    .all(accountId) as Deal[];
}

export function getDealsInDateRange(
  startDate: string,
  endDate: string,
): Deal[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM deals 
    WHERE (closed_at BETWEEN ? AND ?) 
       OR (closed_at IS NULL AND created_at BETWEEN ? AND ?)
  `,
    )
    .all(startDate, endDate, startDate, endDate) as Deal[];
}

export function getClosedWonDealsInRange(
  startDate: string,
  endDate: string,
): Deal[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM deals 
    WHERE stage = 'Closed Won' 
    AND closed_at BETWEEN ? AND ?
  `,
    )
    .all(startDate, endDate) as Deal[];
}

export function getOpenDeals(): Deal[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM deals 
    WHERE stage NOT IN ('Closed Won', 'Closed Lost')
  `,
    )
    .all() as Deal[];
}

export function getAllActivities(): Activity[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM activities").all() as Activity[];
}

export function getActivitiesByDeal(dealId: string): Activity[] {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM activities WHERE deal_id = ?")
    .all(dealId) as Activity[];
}

export function getActivitiesInDateRange(
  startDate: string,
  endDate: string,
): Activity[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM activities 
    WHERE timestamp BETWEEN ? AND ?
  `,
    )
    .all(startDate, endDate) as Activity[];
}

export function getAllTargets(): Target[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM targets ORDER BY month").all() as Target[];
}

export function getTargetByMonth(month: string): Target | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM targets WHERE month = ?").get(month) as
    | Target
    | undefined;
}

export function getTargetsInRange(
  startMonth: string,
  endMonth: string,
): Target[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM targets 
    WHERE month BETWEEN ? AND ?
    ORDER BY month
  `,
    )
    .all(startMonth, endMonth) as Target[];
}

// Aggregation queries
export function getRevenueByMonth(): {
  month: string;
  revenue: number;
  deals: number;
}[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT 
      substr(closed_at, 1, 7) as month,
      SUM(amount) as revenue,
      COUNT(*) as deals
    FROM deals 
    WHERE stage = 'Closed Won' AND closed_at IS NOT NULL
    GROUP BY substr(closed_at, 1, 7)
    ORDER BY month
  `,
    )
    .all() as { month: string; revenue: number; deals: number }[];
}

export function getPipelineByStage(): {
  stage: string;
  total: number;
  count: number;
}[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT 
      stage,
      SUM(amount) as total,
      COUNT(*) as count
    FROM deals 
    WHERE stage NOT IN ('Closed Won', 'Closed Lost')
    GROUP BY stage
  `,
    )
    .all() as { stage: string; total: number; count: number }[];
}

export function getWinRateBySegment(): {
  segment: string;
  won: number;
  total: number;
}[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT 
      a.segment,
      SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
      COUNT(*) as total
    FROM deals d
    JOIN accounts a ON d.account_id = a.account_id
    WHERE d.stage IN ('Closed Won', 'Closed Lost')
    GROUP BY a.segment
  `,
    )
    .all() as { segment: string; won: number; total: number }[];
}

export function getRepPerformance(): {
  rep_id: string;
  name: string;
  won: number;
  lost: number;
  revenue: number;
  deals: number;
}[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT 
      r.rep_id,
      r.name,
      SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
      SUM(CASE WHEN d.stage = 'Closed Lost' THEN 1 ELSE 0 END) as lost,
      SUM(CASE WHEN d.stage = 'Closed Won' THEN d.amount ELSE 0 END) as revenue,
      COUNT(*) as deals
    FROM reps r
    LEFT JOIN deals d ON r.rep_id = d.rep_id
    GROUP BY r.rep_id, r.name
  `,
    )
    .all() as {
    rep_id: string;
    name: string;
    won: number;
    lost: number;
    revenue: number;
    deals: number;
  }[];
}

export function getAccountActivityCounts(): {
  account_id: string;
  name: string;
  segment: string;
  activity_count: number;
  last_activity: string | null;
  open_deal_value: number;
}[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT 
      a.account_id,
      a.name,
      a.segment,
      COUNT(DISTINCT act.activity_id) as activity_count,
      MAX(act.timestamp) as last_activity,
      COALESCE(SUM(CASE WHEN d.stage NOT IN ('Closed Won', 'Closed Lost') THEN d.amount ELSE 0 END), 0) as open_deal_value
    FROM accounts a
    LEFT JOIN deals d ON a.account_id = d.account_id
    LEFT JOIN activities act ON d.deal_id = act.deal_id
    GROUP BY a.account_id, a.name, a.segment
  `,
    )
    .all() as {
    account_id: string;
    name: string;
    segment: string;
    activity_count: number;
    last_activity: string | null;
    open_deal_value: number;
  }[];
}
