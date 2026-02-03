import {
  DriversResponse,
  DriverMetric,
  PipelineStage,
  SegmentData,
  MonthlyData,
} from "../types";
import * as models from "../models";
import {
  getCurrentQuarter,
  getPreviousQuarter,
  getDaysBetween,
  getMonthLabel,
} from "../utils/dateUtils";
import {
  calculatePercentageChange,
  calculateWinRate,
  calculateAverage,
  determineImpact,
  determineTrend,
} from "../utils/calculations";

const STAGE_COLORS: Record<string, string> = {
  Prospecting: "#94a3b8",
  Qualification: "#60a5fa",
  Proposal: "#a78bfa",
  Negotiation: "#fbbf24",
  "Closed Won": "#34d399",
  "Closed Lost": "#f87171",
};

export function getDrivers(): DriversResponse {
  const currentQuarter = getCurrentQuarter();
  const previousQuarter = getPreviousQuarter();

  // Get all deals
  const allDeals = models.getAllDeals();
  const currentQuarterDeals = allDeals.filter(
    (d) =>
      d.created_at >= currentQuarter.start &&
      d.created_at <= currentQuarter.end,
  );
  const previousQuarterDeals = allDeals.filter(
    (d) =>
      d.created_at >= previousQuarter.start &&
      d.created_at <= previousQuarter.end,
  );

  // Pipeline Size
  const openDeals = models.getOpenDeals();
  const currentPipeline = openDeals.reduce((sum, d) => sum + d.amount, 0);
  const previousOpenDeals = allDeals.filter(
    (d) =>
      d.stage !== "Closed Won" &&
      d.stage !== "Closed Lost" &&
      d.created_at <= previousQuarter.end,
  );
  const previousPipeline = previousOpenDeals.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  const pipelineChange = calculatePercentageChange(
    currentPipeline,
    previousPipeline,
  );

  const pipelineSize: DriverMetric = {
    name: "Pipeline Size",
    current: currentPipeline,
    previous: previousPipeline,
    change: currentPipeline - previousPipeline,
    changePercentage: pipelineChange,
    trend: determineTrend(pipelineChange),
    impact: determineImpact(pipelineChange),
    benchmark: 2500000,
  };

  // Win Rate
  const currentClosed = allDeals.filter(
    (d) =>
      (d.stage === "Closed Won" || d.stage === "Closed Lost") &&
      d.closed_at &&
      d.closed_at >= currentQuarter.start &&
      d.closed_at <= currentQuarter.end,
  );
  const currentWon = currentClosed.filter(
    (d) => d.stage === "Closed Won",
  ).length;
  const currentWinRate = calculateWinRate(currentWon, currentClosed.length);

  const previousClosed = allDeals.filter(
    (d) =>
      (d.stage === "Closed Won" || d.stage === "Closed Lost") &&
      d.closed_at &&
      d.closed_at >= previousQuarter.start &&
      d.closed_at <= previousQuarter.end,
  );
  const previousWon = previousClosed.filter(
    (d) => d.stage === "Closed Won",
  ).length;
  const previousWinRate = calculateWinRate(previousWon, previousClosed.length);

  const winRateChange = currentWinRate - previousWinRate;

  const winRate: DriverMetric = {
    name: "Win Rate",
    current: currentWinRate,
    previous: previousWinRate,
    change: winRateChange,
    changePercentage: winRateChange,
    trend: determineTrend(winRateChange),
    impact: determineImpact(winRateChange),
    benchmark: 30,
  };

  // Average Deal Size
  const currentWonDeals = currentClosed.filter((d) => d.stage === "Closed Won");
  const previousWonDeals = previousClosed.filter(
    (d) => d.stage === "Closed Won",
  );

  const currentAvgDealSize = calculateAverage(
    currentWonDeals.map((d) => d.amount),
  );
  const previousAvgDealSize = calculateAverage(
    previousWonDeals.map((d) => d.amount),
  );

  const avgDealSizeChange = calculatePercentageChange(
    currentAvgDealSize,
    previousAvgDealSize,
  );

  const avgDealSize: DriverMetric = {
    name: "Avg Deal Size",
    current: currentAvgDealSize,
    previous: previousAvgDealSize,
    change: currentAvgDealSize - previousAvgDealSize,
    changePercentage: avgDealSizeChange,
    trend: determineTrend(avgDealSizeChange),
    impact: determineImpact(avgDealSizeChange),
    benchmark: 45000,
  };

  // Sales Cycle Time
  const currentCycleTimes = currentWonDeals
    .filter((d) => d.closed_at && d.created_at)
    .map((d) => getDaysBetween(d.created_at, d.closed_at!));
  const previousCycleTimes = previousWonDeals
    .filter((d) => d.closed_at && d.created_at)
    .map((d) => getDaysBetween(d.created_at, d.closed_at!));

  const currentCycleTime = calculateAverage(currentCycleTimes);
  const previousCycleTime = calculateAverage(previousCycleTimes);

  const cycleTimeChange = calculatePercentageChange(
    currentCycleTime,
    previousCycleTime,
  );

  const salesCycleTime: DriverMetric = {
    name: "Sales Cycle",
    current: currentCycleTime,
    previous: previousCycleTime,
    change: currentCycleTime - previousCycleTime,
    changePercentage: cycleTimeChange,
    trend: determineTrend(cycleTimeChange),
    impact: determineImpact(cycleTimeChange, false), // Lower is better
    benchmark: 45,
  };

  // Pipeline by Stage
  const pipelineData = models.getPipelineByStage();
  const pipelineByStage: PipelineStage[] = pipelineData.map((p) => ({
    stage: p.stage,
    value: p.total,
    count: p.count,
    color: STAGE_COLORS[p.stage] || "#64748b",
  }));

  // Win Rate by Segment
  const segmentData = models.getWinRateBySegment();
  const winRateBySegment: SegmentData[] = segmentData.map((s) => ({
    segment: s.segment,
    winRate: calculateWinRate(s.won, s.total),
    dealCount: s.total,
  }));

  // Deal Size Distribution
  const allWonDeals = allDeals.filter((d) => d.stage === "Closed Won");
  const ranges = [
    { range: "< $10K", min: 0, max: 10000 },
    { range: "$10K-$25K", min: 10000, max: 25000 },
    { range: "$25K-$50K", min: 25000, max: 50000 },
    { range: "$50K-$100K", min: 50000, max: 100000 },
    { range: "> $100K", min: 100000, max: Infinity },
  ];

  const dealSizeDistribution = ranges.map((r) => {
    const dealsInRange = allWonDeals.filter(
      (d) => d.amount >= r.min && d.amount < r.max,
    );
    return {
      range: r.range,
      count: dealsInRange.length,
      value: dealsInRange.reduce((sum, d) => sum + d.amount, 0),
    };
  });

  // Monthly Trend
  const revenueByMonth = models.getRevenueByMonth();
  const targets = models.getAllTargets();

  const monthlyTrend: MonthlyData[] = targets.slice(-12).map((t) => {
    const monthRevenue = revenueByMonth.find((r) => r.month === t.month);
    return {
      month: getMonthLabel(t.month),
      revenue: monthRevenue?.revenue || 0,
      target: t.target,
      deals: monthRevenue?.deals || 0,
    };
  });

  return {
    pipelineSize,
    winRate,
    avgDealSize,
    salesCycleTime,
    pipelineByStage,
    winRateBySegment,
    dealSizeDistribution,
    monthlyTrend,
  };
}
