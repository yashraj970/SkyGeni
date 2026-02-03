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
  AttachMoney as RevenueIcon,
  Flag as TargetIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Handshake as DealsIcon,
} from "@mui/icons-material";
import { SummaryData } from "../types";
import MetricCard from "./common/MetricCard";
import GaugeChart from "./charts/GaugeChart";

interface SummarySectionProps {
  data: SummaryData | null;
  loading: boolean;
}

// Safe formatCurrency that handles null/undefined
const formatCurrency = (value: number | null | undefined): string => {
  const safeValue = value ?? 0;
  if (safeValue >= 1000000) {
    return `$${(safeValue / 1000000).toFixed(2)}M`;
  }
  if (safeValue >= 1000) {
    return `$${(safeValue / 1000).toFixed(0)}K`;
  }
  return `$${safeValue.toFixed(0)}`;
};

const SummarySection: React.FC<SummarySectionProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="50%" />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Safe access with defaults
  const currentQuarterRevenue = data.currentQuarterRevenue ?? 0;
  const target = data.target ?? 0;
  const gap = data.gap ?? 0;
  const status = data.status || "on-track";
  const qoqChange = data.qoqChange ?? 0;
  const yoyChange = data.yoyChange ?? 0;
  const quarterLabel = data.quarterLabel || "Current Quarter";
  const daysRemaining = data.daysRemaining ?? 0;
  const closedDeals = data.closedDeals ?? 0;
  const openDeals = data.openDeals ?? 0;
  const totalPipeline = data.totalPipeline ?? 0;

  return (
    <Box>
      {/* Status Banner */}
      <Card
        sx={{
          mb: 3,
          background:
            status === "ahead"
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : status === "behind"
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  {quarterLabel} Performance
                </Typography>
                <Chip
                  label={status.replace("-", " ").toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {status === "behind" ? "We're " : "We're "}
                {formatCurrency(Math.abs(gap))}
                {status === "behind" ? " behind target" : " ahead of target"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {daysRemaining} days remaining in quarter • {closedDeals} deals
                closed
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <GaugeChart
                  value={currentQuarterRevenue}
                  target={target || 1} // Avoid division by zero
                  label="Target Achievement"
                  width={180}
                  height={120}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Current Quarter Revenue"
            value={formatCurrency(currentQuarterRevenue)}
            change={qoqChange}
            changeLabel="vs last quarter"
            icon={<RevenueIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Quarterly Target"
            value={formatCurrency(target)}
            subtitle={`Gap: ${formatCurrency(Math.abs(gap))}`}
            icon={<TargetIcon />}
            color="#7c3aed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Year-over-Year"
            value={`${yoyChange > 0 ? "+" : ""}${yoyChange.toFixed(1)}%`}
            icon={yoyChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={yoyChange >= 0 ? "#10b981" : "#ef4444"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Pipeline"
            value={formatCurrency(totalPipeline)}
            subtitle={`${openDeals} active deals`}
            icon={<DealsIcon />}
            color="#f59e0b"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummarySection;
