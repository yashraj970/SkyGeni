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

// Safe formatCurrency that handles null/undefined
const formatCurrency = (value: number | null | undefined): string => {
  const safeValue = value ?? 0;
  if (safeValue >= 1000000) return `$${(safeValue / 1000000).toFixed(2)}M`;
  if (safeValue >= 1000) return `$${(safeValue / 1000).toFixed(0)}K`;
  return `$${safeValue.toFixed(0)}`;
};

interface RiskItemProps {
  risk: RiskFactor;
}

const RiskItem: React.FC<RiskItemProps> = ({ risk }) => {
  // Safe access with defaults
  const severity = risk.severity || "low";
  const potentialImpact = risk.potentialImpact ?? 0;
  const title = risk.title || "Unknown Risk";
  const description = risk.description || "No description available";
  const entityName = risk.entity?.name || "Unknown";
  const suggestedAction =
    risk.suggestedAction || "Review and take appropriate action";

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: `${getSeverityColor(severity)}.main`,
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
                  getSeverityColor(severity) === "error"
                    ? "#ef4444"
                    : getSeverityColor(severity) === "warning"
                      ? "#f59e0b"
                      : "#3b82f6",
                  0.1,
                ),
                color: `${getSeverityColor(severity)}.main`,
              }}
            >
              {getTypeIcon(risk.type || "stale-deal")}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entityName}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={(severity || "low").toUpperCase()}
              size="small"
              color={getSeverityColor(severity) as any}
              variant="outlined"
            />
            <Tooltip title={`At risk: ${formatCurrency(potentialImpact)}`}>
              <Chip
                icon={<MoneyIcon sx={{ fontSize: 14 }} />}
                label={formatCurrency(potentialImpact)}
                size="small"
                color="default"
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {description}
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
              {suggestedAction}
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

  // Safe access to arrays with defaults
  const staleDeals = data.staleDeals || [];
  const underperformingReps = data.underperformingReps || [];
  const lowActivityAccounts = data.lowActivityAccounts || [];
  const summary = data.summary || {
    totalRisks: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    totalAtRisk: 0,
  };

  const tabs = [
    { label: "All Risks", count: summary.totalRisks || 0 },
    { label: "Stale Deals", count: staleDeals.length },
    { label: "Underperforming Reps", count: underperformingReps.length },
    { label: "Low Activity Accounts", count: lowActivityAccounts.length },
  ];

  const getRisksForTab = (): RiskFactor[] => {
    switch (tabValue) {
      case 1:
        return staleDeals;
      case 2:
        return underperformingReps;
      case 3:
        return lowActivityAccounts;
      default:
        return [
          ...staleDeals,
          ...underperformingReps,
          ...lowActivityAccounts,
        ].sort((a, b) => {
          const severityOrder: Record<string, number> = {
            high: 0,
            medium: 1,
            low: 2,
          };
          return (
            (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2)
          );
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
              {summary.highSeverity ?? 0}
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
              {summary.mediumSeverity ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Medium Severity
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {summary.lowSeverity ?? 0}
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
              {formatCurrency(summary.totalAtRisk)}
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
            {getRisksForTab().map((risk, index) => (
              <RiskItem key={risk.id || `risk-${index}`} risk={risk} />
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
