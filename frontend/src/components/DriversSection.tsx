import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
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

const formatValue = (value: number, type: string): string => {
  switch (type) {
    case "currency":
      if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toFixed(0)}`;
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "days":
      return `${value.toFixed(0)} days`;
    default:
      return value.toLocaleString();
  }
};

const DriverCard: React.FC<{
  metric: DriverMetric;
  icon: React.ReactNode;
  valueType: string;
}> = ({ metric, icon, valueType }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
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
  }[metric.impact] as "success" | "error" | "default";

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
              {metric.name}
            </Typography>
          </Box>
          <Chip
            label={metric.impact}
            size="small"
            color={impactColor}
            variant="outlined"
          />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {formatValue(metric.current, valueType)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color:
                metric.changePercentage > 0
                  ? "success.main"
                  : metric.changePercentage < 0
                    ? "error.main"
                    : "text.secondary",
            }}
          >
            {getTrendIcon()}
            <Typography variant="body2" sx={{ fontWeight: 600, ml: 0.5 }}>
              {metric.changePercentage > 0 ? "+" : ""}
              {metric.changePercentage.toFixed(1)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            vs previous period
          </Typography>
        </Box>

        <TrendChart
          data={{
            current: metric.current,
            previous: metric.previous,
            change: metric.changePercentage,
          }}
          width={200}
          height={40}
        />

        {metric.benchmark && (
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
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.winRate}
            icon={<Assessment sx={{ fontSize: 20 }} />}
            valueType="percentage"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.avgDealSize}
            icon={<Speed sx={{ fontSize: 20 }} />}
            valueType="currency"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DriverCard
            metric={data.salesCycleTime}
            icon={<Timer sx={{ fontSize: 20 }} />}
            valueType="days"
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
              <BarChart
                data={data.pipelineByStage.map((stage) => ({
                  label: stage.stage,
                  value: stage.value,
                  color: stage.color,
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
              <DonutChart
                data={data.winRateBySegment.map((seg) => ({
                  label: seg.segment,
                  value: seg.dealCount,
                }))}
                width={200}
                height={200}
                centerLabel="Avg Win Rate"
                centerValue={`${(
                  data.winRateBySegment.reduce((sum, s) => sum + s.winRate, 0) /
                  data.winRateBySegment.length
                ).toFixed(0)}%`}
              />
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
              <LineChart
                data={data.monthlyTrend.map((m) => ({
                  label: m.month,
                  value: m.revenue,
                  target: m.target,
                }))}
                width={900}
                height={280}
                showTarget
                showArea
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriversSection;
