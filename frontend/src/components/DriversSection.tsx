import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Speed,
  Timer,
  ShowChart,
  Assessment,
} from "@mui/icons-material";
import { DriversData, DriverMetric } from "../types";
import BarChart from "./charts/BarChart";
import LineChart from "./charts/LineChart";
import DonutChart from "./charts/DonutChart";
import TrendChart from "./charts/TrendChart";

interface DriversSectionProps {
  data: DriversData | null;
  loading: boolean;
}

const formatValue = (
  value: number | null | undefined,
  type: string,
): string => {
  const safeValue = value ?? 0;
  switch (type) {
    case "currency":
      if (safeValue >= 1000000) return `$${(safeValue / 1000000).toFixed(2)}M`;
      if (safeValue >= 1000) return `$${(safeValue / 1000).toFixed(0)}K`;
      return `$${safeValue.toFixed(0)}`;
    case "percentage":
      return `${safeValue.toFixed(1)}%`;
    case "days":
      return `${safeValue.toFixed(0)} days`;
    default:
      return safeValue.toLocaleString();
  }
};

const DriverCard: React.FC<{
  metric: DriverMetric | null | undefined;
  icon: React.ReactNode;
  valueType: string;
  title: string;
}> = ({ metric, icon, valueType, title }) => {
  // Handle null/undefined metric
  if (!metric) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: "primary.main",
                color: "white",
              }}
            >
              {icon}
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            N/A
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const current = metric.current ?? 0;
  const previous = metric.previous ?? 0;
  const changePercentage = metric.changePercentage ?? 0;
  const trend = metric.trend || "stable";
  const impact = metric.impact || "neutral";
  const name = metric.name || title;

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp sx={{ fontSize: 18 }} />;
      case "down":
        return <TrendingDown sx={{ fontSize: 18 }} />;
      default:
        return <TrendingFlat sx={{ fontSize: 18 }} />;
    }
  };

  const impactColor = {
    positive: "success",
    negative: "error",
    neutral: "default",
  }[impact] as "success" | "error" | "default";

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: "primary.main",
                color: "white",
              }}
            >
              {icon}
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              {name}
            </Typography>
          </Box>
          <Chip
            label={impact}
            size="small"
            color={impactColor}
            variant="outlined"
          />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {formatValue(current, valueType)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color:
                changePercentage > 0
                  ? "success.main"
                  : changePercentage < 0
                    ? "error.main"
                    : "text.secondary",
            }}
          >
            {getTrendIcon()}
            <Typography variant="body2" sx={{ fontWeight: 600, ml: 0.5 }}>
              {changePercentage > 0 ? "+" : ""}
              {changePercentage.toFixed(1)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            vs previous period
          </Typography>
        </Box>

        <TrendChart
          data={{
            current,
            previous,
            change: changePercentage,
          }}
          width={200}
          height={40}
        />

        {metric.benchmark != null && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Benchmark: {formatValue(metric.benchmark, valueType)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const DriversSection: React.FC<DriversSectionProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Safe access with defaults
  const pipelineByStage = data.pipelineByStage || [];
  const winRateBySegment = data.winRateBySegment || [];
  const monthlyTrend = data.monthlyTrend || [];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Revenue Drivers
      </Typography>

      {/* Driver Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.pipelineSize}
            icon={<ShowChart sx={{ fontSize: 20 }} />}
            valueType="currency"
            title="Pipeline Size"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.winRate}
            icon={<Assessment sx={{ fontSize: 20 }} />}
            valueType="percentage"
            title="Win Rate"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.avgDealSize}
            icon={<Speed sx={{ fontSize: 20 }} />}
            valueType="currency"
            title="Avg Deal Size"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.salesCycleTime}
            icon={<Timer sx={{ fontSize: 20 }} />}
            valueType="days"
            title="Sales Cycle"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Pipeline by Stage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Pipeline by Stage
              </Typography>
              {pipelineByStage.length > 0 ? (
                <BarChart
                  data={pipelineByStage.map((stage) => ({
                    label: stage.stage || "Unknown",
                    value: stage.value ?? 0,
                    color: stage.color || "#64748b",
                  }))}
                  width={450}
                  height={250}
                  horizontal
                  formatValue={(v) =>
                    v >= 1000000
                      ? `$${(v / 1000000).toFixed(1)}M`
                      : `$${(v / 1000).toFixed(0)}K`
                  }
                />
              ) : (
                <Typography color="text.secondary">
                  No pipeline data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Win Rate by Segment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Win Rate by Segment
              </Typography>
              {winRateBySegment.length > 0 ? (
                <DonutChart
                  data={winRateBySegment.map((seg) => ({
                    label: seg.segment || "Unknown",
                    value: seg.dealCount ?? 0,
                  }))}
                  width={200}
                  height={200}
                  centerLabel="Avg Win Rate"
                  centerValue={`${(
                    winRateBySegment.reduce(
                      (sum, s) => sum + (s.winRate ?? 0),
                      0,
                    ) / (winRateBySegment.length || 1)
                  ).toFixed(0)}%`}
                />
              ) : (
                <Typography color="text.secondary">
                  No segment data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Monthly Revenue vs Target
              </Typography>
              {monthlyTrend.length > 0 ? (
                <LineChart
                  data={monthlyTrend.map((m) => ({
                    label: m.month || "Unknown",
                    value: m.revenue ?? 0,
                    target: m.target ?? 0,
                  }))}
                  width={900}
                  height={280}
                  showTarget
                  showArea
                />
              ) : (
                <Typography color="text.secondary">
                  No trend data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriversSection;
