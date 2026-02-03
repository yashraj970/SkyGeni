import { queryAll, queryOne } from "../config/database";
import { Account, Rep, Deal, Activity, Target } from "../types";

export function getAllAccounts(): Account[] {
  return queryAll<Account>("SELECT * FROM accounts");
}

export function getAccountById(id: string): Account | undefined {
  return queryOne<Account>("SELECT * FROM accounts WHERE account_id = ?", [id]);
}

export function getAllReps(): Rep[] {
  return queryAll<Rep>("SELECT * FROM reps");
}

export function getRepById(id: string): Rep | undefined {
  return queryOne<Rep>("SELECT * FROM reps WHERE rep_id = ?", [id]);
}

export function getAllDeals(): Deal[] {
  return queryAll<Deal>("SELECT * FROM deals");
}

export function getDealsByStage(stage: string): Deal[] {
  return queryAll<Deal>("SELECT * FROM deals WHERE stage = ?", [stage]);
}

export function getDealsByRep(repId: string): Deal[] {
  return queryAll<Deal>("SELECT * FROM deals WHERE rep_id = ?", [repId]);
}

export function getDealsByAccount(accountId: string): Deal[] {
  return queryAll<Deal>("SELECT * FROM deals WHERE account_id = ?", [
    accountId,
  ]);
}

export function getDealsInDateRange(
  startDate: string,
  endDate: string,
): Deal[] {
  return queryAll<Deal>(
    `
    SELECT * FROM deals 
    WHERE (closed_at BETWEEN ? AND ?) 
       OR (closed_at IS NULL AND created_at BETWEEN ? AND ?)
  `,
    [startDate, endDate, startDate, endDate],
  );
}

export function getClosedWonDealsInRange(
  startDate: string,
  endDate: string,
): Deal[] {
  return queryAll<Deal>(
    `
    SELECT * FROM deals 
    WHERE stage = 'Closed Won' 
    AND closed_at BETWEEN ? AND ?
  `,
    [startDate, endDate],
  );
}

export function getOpenDeals(): Deal[] {
  return queryAll<Deal>(`
    SELECT * FROM deals 
    WHERE stage NOT IN ('Closed Won', 'Closed Lost')
  `);
}

export function getAllActivities(): Activity[] {
  return queryAll<Activity>("SELECT * FROM activities");
}

export function getActivitiesByDeal(dealId: string): Activity[] {
  return queryAll<Activity>("SELECT * FROM activities WHERE deal_id = ?", [
    dealId,
  ]);
}

export function getActivitiesInDateRange(
  startDate: string,
  endDate: string,
): Activity[] {
  return queryAll<Activity>(
    `
    SELECT * FROM activities 
    WHERE timestamp BETWEEN ? AND ?
  `,
    [startDate, endDate],
  );
}

export function getAllTargets(): Target[] {
  return queryAll<Target>("SELECT * FROM targets ORDER BY month");
}

export function getTargetByMonth(month: string): Target | undefined {
  return queryOne<Target>("SELECT * FROM targets WHERE month = ?", [month]);
}

export function getTargetsInRange(
  startMonth: string,
  endMonth: string,
): Target[] {
  return queryAll<Target>(
    `
    SELECT * FROM targets 
    WHERE month BETWEEN ? AND ?
    ORDER BY month
  `,
    [startMonth, endMonth],
  );
}

// Aggregation queries
export function getRevenueByMonth(): {
  month: string;
  revenue: number;
  deals: number;
}[] {
  return queryAll<{ month: string; revenue: number; deals: number }>(`
    SELECT 
      substr(closed_at, 1, 7) as month,
      SUM(amount) as revenue,
      COUNT(*) as deals
    FROM deals 
    WHERE stage = 'Closed Won' AND closed_at IS NOT NULL
    GROUP BY substr(closed_at, 1, 7)
    ORDER BY month
  `);
}

export function getPipelineByStage(): {
  stage: string;
  total: number;
  count: number;
}[] {
  return queryAll<{ stage: string; total: number; count: number }>(`
    SELECT 
      stage,
      SUM(amount) as total,
      COUNT(*) as count
    FROM deals 
    WHERE stage NOT IN ('Closed Won', 'Closed Lost')
    GROUP BY stage
  `);
}

export function getWinRateBySegment(): {
  segment: string;
  won: number;
  total: number;
}[] {
  return queryAll<{ segment: string; won: number; total: number }>(`
    SELECT 
      a.segment,
      SUM(CASE WHEN d.stage = 'Closed Won' THEN 1 ELSE 0 END) as won,
      COUNT(*) as total
    FROM deals d
    JOIN accounts a ON d.account_id = a.account_id
    WHERE d.stage IN ('Closed Won', 'Closed Lost')
    GROUP BY a.segment
  `);
}

export function getRepPerformance(): {
  rep_id: string;
  name: string;
  won: number;
  lost: number;
  revenue: number;
  deals: number;
}[] {
  return queryAll<{
    rep_id: string;
    name: string;
    won: number;
    lost: number;
    revenue: number;
    deals: number;
  }>(`
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
  `);
}

export function getAccountActivityCounts(): {
  account_id: string;
  name: string;
  segment: string;
  activity_count: number;
  last_activity: string | null;
  open_deal_value: number;
}[] {
  return queryAll<{
    account_id: string;
    name: string;
    segment: string;
    activity_count: number;
    last_activity: string | null;
    open_deal_value: number;
  }>(`
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
  `);
}
