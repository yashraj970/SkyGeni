export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateWinRate(won: number, total: number): number {
  if (total === 0) return 0;
  return (won / total) * 100;
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function determineImpact(
  changePercentage: number,
  isPositiveGood: boolean = true,
): "positive" | "negative" | "neutral" {
  const threshold = 5; // 5% threshold for significance

  if (Math.abs(changePercentage) < threshold) return "neutral";

  if (isPositiveGood) {
    return changePercentage > 0 ? "positive" : "negative";
  } else {
    return changePercentage < 0 ? "positive" : "negative";
  }
}

export function determineTrend(
  changePercentage: number,
): "up" | "down" | "stable" {
  const threshold = 2;

  if (changePercentage > threshold) return "up";
  if (changePercentage < -threshold) return "down";
  return "stable";
}

export function determineSeverity(
  value: number,
  thresholds: { high: number; medium: number },
): "high" | "medium" | "low" {
  if (value >= thresholds.high) return "high";
  if (value >= thresholds.medium) return "medium";
  return "low";
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}
