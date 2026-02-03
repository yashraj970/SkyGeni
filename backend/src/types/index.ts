// Database Models
export interface Account {
  account_id: string;
  name: string;
  industry: string;
  segment: string;
}

export interface Rep {
  rep_id: string;
  name: string;
}

export interface Deal {
  deal_id: string;
  account_id: string;
  rep_id: string;
  stage: string;
  amount: number;
  created_at: string;
  closed_at: string | null;
}

export interface Activity {
  activity_id: string;
  deal_id: string;
  type: string;
  timestamp: string;
}

export interface Target {
  month: string;
  target: number;
}

// API Response Types
export interface SummaryResponse {
  currentQuarterRevenue: number;
  target: number;
  gap: number;
  gapPercentage: number;
  status: "ahead" | "behind" | "on-track";
  yoyChange: number;
  qoqChange: number;
  quarterLabel: string;
  closedDeals: number;
  openDeals: number;
  totalPipeline: number;
  daysRemaining: number;
}

export interface DriverMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: "up" | "down" | "stable";
  impact: "positive" | "negative" | "neutral";
  benchmark?: number;
}

export interface PipelineStage {
  stage: string;
  value: number;
  count: number;
  color: string;
}

export interface SegmentData {
  segment: string;
  winRate: number;
  dealCount: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  target: number;
  deals: number;
}

export interface DriversResponse {
  pipelineSize: DriverMetric;
  winRate: DriverMetric;
  avgDealSize: DriverMetric;
  salesCycleTime: DriverMetric;
  pipelineByStage: PipelineStage[];
  winRateBySegment: SegmentData[];
  dealSizeDistribution: { range: string; count: number; value: number }[];
  monthlyTrend: MonthlyData[];
}

export interface RiskFactor {
  id: string;
  type: "stale-deal" | "underperforming-rep" | "low-activity-account";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  metric: string;
  metricValue: number;
  threshold: number;
  potentialImpact: number;
  entity: {
    id: string;
    name: string;
    type: string;
  };
  suggestedAction: string;
  lastUpdated: string;
}

export interface RiskFactorsResponse {
  summary: {
    totalRisks: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    totalAtRisk: number;
  };
  staleDeals: RiskFactor[];
  underperformingReps: RiskFactor[];
  lowActivityAccounts: RiskFactor[];
}

export interface Recommendation {
  id: string;
  priority: number;
  category: "deal-focus" | "rep-coaching" | "account-activity" | "strategy";
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: number;
  effort: "low" | "medium" | "high";
  timeframe: string;
  actionItems: string[];
  relatedEntities: {
    type: string;
    id: string;
    name: string;
  }[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  generatedAt: string;
  dataFreshness: string;
}
