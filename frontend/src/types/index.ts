// API Response Types
export interface SummaryData {
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

export interface DriversData {
  pipelineSize: DriverMetric;
  winRate: DriverMetric;
  avgDealSize: DriverMetric;
  salesCycleTime: DriverMetric;
  pipelineByStage: PipelineStage[];
  winRateBySegment: SegmentData[];
  dealSizeDistribution: DealSizeData[];
  monthlyTrend: MonthlyData[];
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

export interface DealSizeData {
  range: string;
  count: number;
  value: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  target: number;
  deals: number;
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

export interface RiskFactorsData {
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

export interface RecommendationsData {
  recommendations: Recommendation[];
  generatedAt: string;
  dataFreshness: string;
}

// Component Props Types
export interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}

// API State Types
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
