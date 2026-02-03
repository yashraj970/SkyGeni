import { SummaryResponse } from "../types";
import * as models from "../models";
import {
  getCurrentQuarter,
  getPreviousQuarter,
  getSameQuarterLastYear,
  getDaysRemainingInQuarter,
  getMonthsInQuarter,
} from "../utils/dateUtils";
import { calculatePercentageChange } from "../utils/calculations";

export function getSummary(): SummaryResponse {
  const currentQuarter = getCurrentQuarter();
  const previousQuarter = getPreviousQuarter();
  const sameQuarterLastYear = getSameQuarterLastYear();

  // Get closed won deals for current quarter
  const currentQuarterDeals = models.getClosedWonDealsInRange(
    currentQuarter.start,
    currentQuarter.end,
  );
  const currentQuarterRevenue = currentQuarterDeals.reduce(
    (sum, deal) => sum + deal.amount,
    0,
  );

  // Get closed won deals for previous quarter
  const previousQuarterDeals = models.getClosedWonDealsInRange(
    previousQuarter.start,
    previousQuarter.end,
  );
  const previousQuarterRevenue = previousQuarterDeals.reduce(
    (sum, deal) => sum + deal.amount,
    0,
  );

  // Get closed won deals for same quarter last year
  const lastYearDeals = models.getClosedWonDealsInRange(
    sameQuarterLastYear.start,
    sameQuarterLastYear.end,
  );
  const lastYearRevenue = lastYearDeals.reduce(
    (sum, deal) => sum + deal.amount,
    0,
  );

  // Get target for current quarter
  const quarterMonths = getMonthsInQuarter(currentQuarter);
  const targets = models.getAllTargets();
  const quarterTarget = targets
    .filter((t) => quarterMonths.includes(t.month))
    .reduce((sum, t) => sum + t.target, 0);

  // Calculate metrics
  const gap = currentQuarterRevenue - quarterTarget;
  const gapPercentage = calculatePercentageChange(
    currentQuarterRevenue,
    quarterTarget,
  );

  // Determine status
  let status: "ahead" | "behind" | "on-track";
  if (gapPercentage > 5) {
    status = "ahead";
  } else if (gapPercentage < -5) {
    status = "behind";
  } else {
    status = "on-track";
  }

  // Get open deals (pipeline)
  const openDeals = models.getOpenDeals();
  const totalPipeline = openDeals.reduce((sum, deal) => sum + deal.amount, 0);

  // Calculate changes
  const qoqChange = calculatePercentageChange(
    currentQuarterRevenue,
    previousQuarterRevenue,
  );
  const yoyChange = calculatePercentageChange(
    currentQuarterRevenue,
    lastYearRevenue,
  );

  return {
    currentQuarterRevenue,
    target: quarterTarget,
    gap,
    gapPercentage,
    status,
    yoyChange,
    qoqChange,
    quarterLabel: currentQuarter.label,
    closedDeals: currentQuarterDeals.length,
    openDeals: openDeals.length,
    totalPipeline,
    daysRemaining: getDaysRemainingInQuarter(),
  };
}
