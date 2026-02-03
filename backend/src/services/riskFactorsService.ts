import { RiskFactorsResponse, RiskFactor } from "../types";
import * as models from "../models";
import { getDaysBetween, formatDate } from "../utils/dateUtils";
import { calculateWinRate, determineSeverity } from "../utils/calculations";

export function getRiskFactors(): RiskFactorsResponse {
  const staleDeals = getStaleDeals();
  const underperformingReps = getUnderperformingReps();
  const lowActivityAccounts = getLowActivityAccounts();

  const allRisks = [
    ...staleDeals,
    ...underperformingReps,
    ...lowActivityAccounts,
  ];

  const summary = {
    totalRisks: allRisks.length,
    highSeverity: allRisks.filter((r) => r.severity === "high").length,
    mediumSeverity: allRisks.filter((r) => r.severity === "medium").length,
    lowSeverity: allRisks.filter((r) => r.severity === "low").length,
    totalAtRisk: allRisks.reduce((sum, r) => sum + (r.potentialImpact || 0), 0),
  };

  return {
    summary,
    staleDeals,
    underperformingReps,
    lowActivityAccounts,
  };
}

function getStaleDeals(): RiskFactor[] {
  const openDeals = models.getOpenDeals();
  const allActivities = models.getAllActivities();
  const accounts = models.getAllAccounts();
  const today = new Date();

  const risks: RiskFactor[] = [];

  for (const deal of openDeals) {
    // Skip deals without proper data
    if (!deal.deal_id || !deal.created_at) continue;

    const dealActivities = allActivities.filter(
      (a) => a.deal_id === deal.deal_id,
    );
    const lastActivity = dealActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];

    const daysSinceLastActivity = lastActivity
      ? getDaysBetween(lastActivity.timestamp, formatDate(today))
      : getDaysBetween(deal.created_at, formatDate(today));

    const daysInStage = getDaysBetween(deal.created_at, formatDate(today));

    // Consider stale if no activity in 14+ days or in same stage for 30+ days
    if (daysSinceLastActivity >= 14 || daysInStage >= 30) {
      const account = accounts.find((a) => a.account_id === deal.account_id);
      const severity = determineSeverity(daysSinceLastActivity, {
        high: 30,
        medium: 21,
      });
      const amount = deal.amount || 0;

      risks.push({
        id: `stale-${deal.deal_id}`,
        type: "stale-deal",
        severity,
        title: `Stale Deal: ${account?.name || deal.account_id || "Unknown"}`,
        description: `Deal has had no activity for ${daysSinceLastActivity} days. Currently in ${deal.stage || "Unknown"} stage.`,
        metric: "Days Since Activity",
        metricValue: daysSinceLastActivity,
        threshold: 14,
        potentialImpact: amount,
        entity: {
          id: deal.deal_id,
          name: account?.name || deal.account_id || "Unknown",
          type: "deal",
        },
        suggestedAction: `Schedule follow-up with ${account?.name || "account"}. Consider deal review if no progress in 7 days.`,
        lastUpdated: lastActivity?.timestamp || deal.created_at,
      });
    }
  }

  return risks.sort((a, b) => {
    const severityOrder: Record<string, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
  });
}

function getUnderperformingReps(): RiskFactor[] {
  const repPerformance = models.getRepPerformance();

  // Calculate average win rate
  let totalWinRate = 0;
  let countWithData = 0;

  for (const rep of repPerformance) {
    const total = (rep.won || 0) + (rep.lost || 0);
    if (total > 0) {
      totalWinRate += ((rep.won || 0) / total) * 100;
      countWithData++;
    }
  }

  const avgWinRate = countWithData > 0 ? totalWinRate / countWithData : 25;

  const risks: RiskFactor[] = [];

  for (const rep of repPerformance) {
    const total = (rep.won || 0) + (rep.lost || 0);
    if (total < 3) continue; // Not enough data

    const winRate = calculateWinRate(rep.won || 0, total);
    const deviation = avgWinRate - winRate;

    // Flag if win rate is 15%+ below average
    if (deviation >= 15) {
      const openDeals = models
        .getDealsByRep(rep.rep_id)
        .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
      const pipelineAtRisk = openDeals.reduce(
        (sum, d) => sum + (d.amount || 0),
        0,
      );

      const severity = determineSeverity(deviation, { high: 25, medium: 20 });

      risks.push({
        id: `rep-${rep.rep_id}`,
        type: "underperforming-rep",
        severity,
        title: `Underperforming Rep: ${rep.name || "Unknown"}`,
        description: `Win rate of ${winRate.toFixed(1)}% is ${deviation.toFixed(1)}% below team average of ${avgWinRate.toFixed(1)}%.`,
        metric: "Win Rate Deviation",
        metricValue: deviation,
        threshold: 15,
        potentialImpact: pipelineAtRisk,
        entity: {
          id: rep.rep_id,
          name: rep.name || "Unknown",
          type: "rep",
        },
        suggestedAction: `Schedule coaching session with ${rep.name || "rep"}. Review lost deals to identify improvement areas.`,
        lastUpdated: formatDate(new Date()),
      });
    }
  }

  return risks.sort(
    (a, b) => (b.potentialImpact || 0) - (a.potentialImpact || 0),
  );
}

function getLowActivityAccounts(): RiskFactor[] {
  const accountActivity = models.getAccountActivityCounts();
  const today = formatDate(new Date());

  const risks: RiskFactor[] = [];

  for (const account of accountActivity) {
    // Skip if no open deals
    const openDealValue = account.open_deal_value || 0;
    if (openDealValue === 0) continue;

    const daysSinceActivity = account.last_activity
      ? getDaysBetween(account.last_activity, today)
      : 999;

    const activityCount = account.activity_count || 0;

    // Flag accounts with low activity and open deals
    if (daysSinceActivity >= 21 || activityCount < 3) {
      const severity = determineSeverity(daysSinceActivity, {
        high: 45,
        medium: 30,
      });

      risks.push({
        id: `account-${account.account_id}`,
        type: "low-activity-account",
        severity,
        title: `Low Activity: ${account.name || "Unknown"}`,
        description: `${account.segment || "Unknown"} account with $${(openDealValue / 1000).toFixed(0)}K in pipeline has only ${activityCount} activities. Last activity: ${daysSinceActivity} days ago.`,
        metric: "Days Since Activity",
        metricValue: daysSinceActivity,
        threshold: 21,
        potentialImpact: openDealValue,
        entity: {
          id: account.account_id,
          name: account.name || "Unknown",
          type: "account",
        },
        suggestedAction: `Increase engagement with ${account.name || "account"}. Schedule call or send relevant content.`,
        lastUpdated: account.last_activity || today,
      });
    }
  }

  return risks
    .sort((a, b) => (b.potentialImpact || 0) - (a.potentialImpact || 0))
    .slice(0, 10);
}
