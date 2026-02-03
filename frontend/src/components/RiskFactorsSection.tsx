import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { RiskFactorsData, RiskFactor } from "../types";

interface RiskFactorsSectionProps {
  data: RiskFactorsData | null;
  loading: boolean;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "high":
      return <ErrorIcon sx={{ color: "error.main" }} />;
    case "medium":
      return <WarningIcon sx={{ color: "warning.main" }} />;
    default:
      return <InfoIcon sx={{ color: "info.main" }} />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    default:
      return "info";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "stale-deal":
      return <ScheduleIcon />;
    case "underperforming-rep":
      return <PersonIcon />;
    case "low-activity-account":
      return <BusinessIcon />;
    default:
      return <WarningIcon />;
  }
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

interface RiskItemProps {
  risk: RiskFactor;
}

const RiskItem: React.FC<RiskItemProps> = ({ risk }) => {
  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: `${getSeverityColor(risk.severity)}.main`,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          transform: "translateX(4px)",
        },
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: alpha(
                  getSeverityColor(risk.severity) === "error"
                    ? "#ef4444"
                    : getSeverityColor(risk.severity) === "warning"
                      ? "#f59e0b"
                      : "#3b82f6",
                  0.1,
                ),
                color: `${getSeverityColor(risk.severity)}.main`,
              }}
            >
              {getTypeIcon(risk.type)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {risk.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {risk.entity.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={risk.severity.toUpperCase()}
              size="small"
              color={getSeverityColor(risk.severity) as any}
              variant="outlined"
            />
            <Tooltip title={`At risk: ${formatCurrency(risk.potentialImpact)}`}>
              <Chip
                icon={<MoneyIcon sx={{ fontSize: 14 }} />}
                label={formatCurrency(risk.potentialImpact)}
                size="small"
                color="default"
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {risk.description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            backgroundColor: "action.hover",
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Suggested Action
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {risk.suggestedAction}
            </Typography>
          </Box>
          <IconButton size="small" color="primary">
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const RiskFactorsSection: React.FC<RiskFactorsSectionProps> = ({
  data,
  loading,
}) => {
  const [tabValue, setTabValue] = useState(0);

  if (loading || !data) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { label: "All Risks", count: data.summary.totalRisks },
    { label: "Stale Deals", count: data.staleDeals.length },
    { label: "Underperforming Reps", count: data.underperformingReps.length },
    { label: "Low Activity Accounts", count: data.lowActivityAccounts.length },
  ];

  const getRisksForTab = () => {
    switch (tabValue) {
      case 1:
        return data.staleDeals;
      case 2:
        return data.underperformingReps;
      case 3:
        return data.lowActivityAccounts;
      default:
        return [
          ...data.staleDeals,
          ...data.underperformingReps,
          ...data.lowActivityAccounts,
        ].sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Risk Factors
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography
              variant="h4"
              color="error.main"
              sx={{ fontWeight: 700 }}
            >
              {data.summary.highSeverity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              High Severity
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography
              variant="h4"
              color="warning.main"
              sx={{ fontWeight: 700 }}
            >
              {data.summary.mediumSeverity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Medium Severity
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {data.summary.lowSeverity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Low Severity
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography
              variant="h4"
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              {formatCurrency(data.summary.totalAtRisk)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total At Risk
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Risk Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab.label}
                  <Chip label={tab.count} size="small" />
                </Box>
              }
            />
          ))}
        </Tabs>
        <CardContent>
          <Box sx={{ maxHeight: 500, overflow: "auto" }}>
            {getRisksForTab().map((risk) => (
              <RiskItem key={risk.id} risk={risk} />
            ))}
            {getRisksForTab().length === 0 && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="text.secondary">
                  No risks found in this category
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RiskFactorsSection;
