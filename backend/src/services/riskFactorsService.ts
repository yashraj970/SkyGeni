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
    totalAtRisk: allRisks.reduce((sum, r) => sum + r.potentialImpact, 0),
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

      risks.push({
        id: `stale-${deal.deal_id}`,
        type: "stale-deal",
        severity,
        title: `Stale Deal: ${account?.name || deal.account_id}`,
        description: `Deal has had no activity for ${daysSinceLastActivity} days. Currently in ${deal.stage} stage.`,
        metric: "Days Since Activity",
        metricValue: daysSinceLastActivity,
        threshold: 14,
        potentialImpact: deal.amount,
        entity: {
          id: deal.deal_id,
          name: account?.name || deal.account_id,
          type: "deal",
        },
        suggestedAction: `Schedule follow-up with ${account?.name || "account"}. Consider deal review if no progress in 7 days.`,
        lastUpdated: lastActivity?.timestamp || deal.created_at,
      });
    }
  }

  return risks.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function getUnderperformingReps(): RiskFactor[] {
  const repPerformance = models.getRepPerformance();
  const avgWinRate =
    repPerformance.reduce((sum, r) => {
      const total = r.won + r.lost;
      return sum + (total > 0 ? (r.won / total) * 100 : 0);
    }, 0) / repPerformance.length;

  const risks: RiskFactor[] = [];

  for (const rep of repPerformance) {
    const total = rep.won + rep.lost;
    if (total < 3) continue; // Not enough data

    const winRate = calculateWinRate(rep.won, total);
    const deviation = avgWinRate - winRate;

    // Flag if win rate is 15%+ below average
    if (deviation >= 15) {
      const openDeals = models
        .getDealsByRep(rep.rep_id)
        .filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
      const pipelineAtRisk = openDeals.reduce((sum, d) => sum + d.amount, 0);

      const severity = determineSeverity(deviation, { high: 25, medium: 20 });

      risks.push({
        id: `rep-${rep.rep_id}`,
        type: "underperforming-rep",
        severity,
        title: `Underperforming Rep: ${rep.name}`,
        description: `Win rate of ${winRate.toFixed(1)}% is ${deviation.toFixed(1)}% below team average of ${avgWinRate.toFixed(1)}%.`,
        metric: "Win Rate Deviation",
        metricValue: deviation,
        threshold: 15,
        potentialImpact: pipelineAtRisk,
        entity: {
          id: rep.rep_id,
          name: rep.name,
          type: "rep",
        },
        suggestedAction: `Schedule coaching session with ${rep.name}. Review lost deals to identify improvement areas.`,
        lastUpdated: formatDate(new Date()),
      });
    }
  }

  return risks.sort((a, b) => b.potentialImpact - a.potentialImpact);
}

function getLowActivityAccounts(): RiskFactor[] {
  const accountActivity = models.getAccountActivityCounts();
  const today = formatDate(new Date());

  const risks: RiskFactor[] = [];

  for (const account of accountActivity) {
    // Skip if no open deals
    if (account.open_deal_value === 0) continue;

    const daysSinceActivity = account.last_activity
      ? getDaysBetween(account.last_activity, today)
      : 999;

    // Flag accounts with low activity and open deals
    if (daysSinceActivity >= 21 || account.activity_count < 3) {
      const severity = determineSeverity(daysSinceActivity, {
        high: 45,
        medium: 30,
      });

      risks.push({
        id: `account-${account.account_id}`,
        type: "low-activity-account",
        severity,
        title: `Low Activity: ${account.name}`,
        description: `${account.segment} account with $${(account.open_deal_value / 1000).toFixed(0)}K in pipeline has only ${account.activity_count} activities. Last activity: ${daysSinceActivity} days ago.`,
        metric: "Days Since Activity",
        metricValue: daysSinceActivity,
        threshold: 21,
        potentialImpact: account.open_deal_value,
        entity: {
          id: account.account_id,
          name: account.name,
          type: "account",
        },
        suggestedAction: `Increase engagement with ${account.name}. Schedule call or send relevant content.`,
        lastUpdated: account.last_activity || today,
      });
    }
  }

  return risks
    .sort((a, b) => b.potentialImpact - a.potentialImpact)
    .slice(0, 10);
}
