export function getCurrentQuarter(): {
  start: string;
  end: string;
  label: string;
  quarter: number;
  year: number;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;

  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, endMonth + 1, 0);

  return {
    start: formatDate(start),
    end: formatDate(end),
    label: `Q${quarter} ${year}`,
    quarter,
    year,
  };
}

export function getPreviousQuarter(): {
  start: string;
  end: string;
  label: string;
  quarter: number;
  year: number;
} {
  const current = getCurrentQuarter();
  let prevQuarter = current.quarter - 1;
  let prevYear = current.year;

  if (prevQuarter === 0) {
    prevQuarter = 4;
    prevYear -= 1;
  }

  const startMonth = (prevQuarter - 1) * 3;
  const endMonth = startMonth + 2;

  const start = new Date(prevYear, startMonth, 1);
  const end = new Date(prevYear, endMonth + 1, 0);

  return {
    start: formatDate(start),
    end: formatDate(end),
    label: `Q${prevQuarter} ${prevYear}`,
    quarter: prevQuarter,
    year: prevYear,
  };
}

export function getSameQuarterLastYear(): {
  start: string;
  end: string;
  label: string;
} {
  const current = getCurrentQuarter();
  const prevYear = current.year - 1;

  const startMonth = (current.quarter - 1) * 3;
  const endMonth = startMonth + 2;

  const start = new Date(prevYear, startMonth, 1);
  const end = new Date(prevYear, endMonth + 1, 0);

  return {
    start: formatDate(start),
    end: formatDate(end),
    label: `Q${current.quarter} ${prevYear}`,
  };
}

export function getDaysRemainingInQuarter(): number {
  const now = new Date();
  const current = getCurrentQuarter();
  const endDate = new Date(current.end);

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getMonthsInQuarter(quarter: {
  start: string;
  end: string;
}): string[] {
  const start = new Date(quarter.start);
  const end = new Date(quarter.end);
  const months: string[] = [];

  const current = new Date(start);
  while (current <= end) {
    months.push(current.toISOString().substring(0, 7));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getMonthLabel(monthStr: string): string {
  const date = new Date(monthStr + "-01");
  return date.toLocaleString("en-US", { month: "short" });
}

export function isWithinDays(date: string, days: number): boolean {
  const targetDate = new Date(date);
  const now = new Date();
  const diffTime = now.getTime() - targetDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}
