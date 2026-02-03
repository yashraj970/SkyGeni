import { RecommendationsResponse, Recommendation } from "../types";
import * as models from "../models";
import { getSummary } from "./summaryService";
import { getDrivers } from "./driversService";
import { getRiskFactors } from "./riskFactorsService";
import { formatDate } from "../utils/dateUtils";

export function getRecommendations(): RecommendationsResponse {
  const summary = getSummary();
  const drivers = getDrivers();
  const risks = getRiskFactors();

  const recommendations: Recommendation[] = [];
  let priority = 1;

  // Recommendation 1: Focus on high-value stale deals
  const highValueStaleDeals = risks.staleDeals
    .filter((r) => r.severity === "high" || r.potentialImpact > 50000)
    .slice(0, 5);

  if (highValueStaleDeals.length > 0) {
    const totalValue = highValueStaleDeals.reduce(
      (sum, d) => sum + d.potentialImpact,
      0,
    );
    recommendations.push({
      id: `rec-${priority}`,
      priority,
      category: "deal-focus",
      title: "Revive High-Value Stale Deals",
      description: `${highValueStaleDeals.length} high-value deals worth $${(totalValue / 1000).toFixed(0)}K have gone cold. Immediate attention needed to prevent loss.`,
      reasoning: `These deals have had no activity for 30+ days but represent significant revenue. Quick engagement can prevent them from going to competitors.`,
      expectedImpact: totalValue * 0.3, // Assume 30% recovery
      effort: "low",
      timeframe: "This week",
      actionItems: [
        "Review each deal status with rep",
        "Send personalized re-engagement email",
        "Schedule follow-up calls within 48 hours",
        "Offer special incentive if appropriate",
      ],
      relatedEntities: highValueStaleDeals.map((d) => ({
        type: "deal",
        id: d.entity.id,
        name: d.entity.name,
      })),
    });
    priority++;
  }

  // Recommendation 2: Coach underperforming reps
  if (risks.underperformingReps.length > 0) {
    const topUnderperformers = risks.underperformingReps.slice(0, 3);
    const totalPipelineAtRisk = topUnderperformers.reduce(
      (sum, r) => sum + r.potentialImpact,
      0,
    );

    recommendations.push({
      id: `rec-${priority}`,
      priority,
      category: "rep-coaching",
      title: `Coach ${topUnderperformers.length} Underperforming Reps`,
      description: `${topUnderperformers.map((r) => r.entity.name).join(", ")} are performing below team average. Combined pipeline at risk: $${(totalPipelineAtRisk / 1000).toFixed(0)}K.`,
      reasoning: `Win rate improvement of even 5% for these reps could recover $${((totalPipelineAtRisk * 0.05) / 1000).toFixed(0)}K in additional revenue this quarter.`,
      expectedImpact: totalPipelineAtRisk * 0.1,
      effort: "medium",
      timeframe: "2-4 weeks",
      actionItems: [
        "Schedule 1:1 coaching sessions",
        "Review lost deal patterns",
        "Shadow on upcoming calls",
        "Create personalized improvement plan",
        "Set weekly check-in meetings",
      ],
      relatedEntities: topUnderperformers.map((r) => ({
        type: "rep",
        id: r.entity.id,
        name: r.entity.name,
      })),
    });
    priority++;
  }

  // Recommendation 3: Increase activity for specific segments
  const lowActivityAccounts = risks.lowActivityAccounts.filter(
    (a) => a.potentialImpact > 30000,
  );
  const segments = [
    ...new Set(lowActivityAccounts.map((a) => a.description.split(" ")[0])),
  ];

  if (lowActivityAccounts.length > 0) {
    const totalAtRisk = lowActivityAccounts.reduce(
      (sum, a) => sum + a.potentialImpact,
      0,
    );

    recommendations.push({
      id: `rec-${priority}`,
      priority,
      category: "account-activity",
      title: "Increase Engagement with Key Accounts",
      description: `${lowActivityAccounts.length} accounts with $${(totalAtRisk / 1000).toFixed(0)}K pipeline have low engagement. Focus on ${segments.slice(0, 2).join(" and ")} segments.`,
      reasoning: `Accounts with consistent engagement are 40% more likely to close. These accounts are at risk of going cold.`,
      expectedImpact: totalAtRisk * 0.25,
      effort: "medium",
      timeframe: "2 weeks",
      actionItems: [
        "Create targeted email campaign",
        "Schedule discovery calls",
        "Share relevant case studies",
        "Assign dedicated follow-up owners",
      ],
      relatedEntities: lowActivityAccounts.slice(0, 5).map((a) => ({
        type: "account",
        id: a.entity.id,
        name: a.entity.name,
      })),
    });
    priority++;
  }

  // Recommendation 4: Pipeline stage optimization
  const stagesWithBottlenecks = drivers.pipelineByStage
    .filter((s) => s.count > 10 && s.stage === "Negotiation")
    .slice(0, 1);

  if (stagesWithBottlenecks.length > 0) {
    const stage = stagesWithBottlenecks[0];
    recommendations.push({
      id: `rec-${priority}`,
      priority,
      category: "strategy",
      title: `Accelerate ${stage.stage} Stage Deals`,
      description: `${stage.count} deals worth $${(stage.value / 1000).toFixed(0)}K are stuck in ${stage.stage}. This stage has higher-than-normal deal count.`,
      reasoning: `Bottleneck in ${stage.stage} suggests potential process or pricing issues. Streamlining could accelerate 20% more deals to close.`,
      expectedImpact: stage.value * 0.2,
      effort: "medium",
      timeframe: "2-3 weeks",
      actionItems: [
        "Review common objections at this stage",
        "Create objection handling playbook",
        "Consider limited-time incentives",
        "Escalate stalled deals to leadership",
      ],
      relatedEntities: [],
    });
    priority++;
  }

  // Recommendation 5: Focus on high-performing segment
  const bestSegment = drivers.winRateBySegment.reduce(
    (best, current) =>
      current.winRate > best.winRate && current.dealCount >= 5 ? current : best,
    drivers.winRateBySegment[0],
  );

  if (bestSegment && bestSegment.winRate > 30) {
    recommendations.push({
      id: `rec-${priority}`,
      priority,
      category: "strategy",
      title: `Double Down on ${bestSegment.segment} Segment`,
      description: `${bestSegment.segment} segment has ${bestSegment.winRate.toFixed(0)}% win rate, highest among all segments. Increase prospecting focus here.`,
      reasoning: `Higher win rates mean more efficient use of sales resources. Shifting 20% more effort to ${bestSegment.segment} could yield significant returns.`,
      expectedImpact: drivers.avgDealSize.current * 5,
      effort: "low",
      timeframe: "Ongoing",
      actionItems: [
        `Identify 10 new ${bestSegment.segment} prospects`,
        "Create segment-specific messaging",
        "Share success patterns with team",
        "Adjust territory planning",
      ],
      relatedEntities: [],
    });
    priority++;
  }

  return {
    recommendations: recommendations.slice(0, 5),
    generatedAt: new Date().toISOString(),
    dataFreshness: "Real-time",
  };
}
