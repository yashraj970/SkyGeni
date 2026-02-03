import React from "react";
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
  Avatar,
  Skeleton,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { RecommendationsData, Recommendation } from "../types";

interface RecommendationsSectionProps {
  data: RecommendationsData | null;
  loading: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "deal-focus":
      return <TrendingUpIcon />;
    case "rep-coaching":
      return <PersonIcon />;
    case "account-activity":
      return <BusinessIcon />;
    case "strategy":
      return <TimelineIcon />;
    default:
      return <LightbulbIcon />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "deal-focus":
      return "#2563eb";
    case "rep-coaching":
      return "#7c3aed";
    case "account-activity":
      return "#10b981";
    case "strategy":
      return "#f59e0b";
    default:
      return "#64748b";
  }
};

const getEffortLabel = (effort: string) => {
  switch (effort) {
    case "low":
      return { label: "Quick Win", color: "success" };
    case "medium":
      return { label: "Moderate Effort", color: "warning" };
    case "high":
      return { label: "Major Initiative", color: "error" };
    default:
      return { label: effort || "Unknown", color: "default" };
  }
};

// Safe formatCurrency
const formatCurrency = (value: number | null | undefined): string => {
  const safeValue = value ?? 0;
  if (safeValue >= 1000000) return `$${(safeValue / 1000000).toFixed(2)}M`;
  if (safeValue >= 1000) return `$${(safeValue / 1000).toFixed(0)}K`;
  return `$${safeValue.toFixed(0)}`;
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index,
}) => {
  // Safe access with defaults
  const category = recommendation.category || "strategy";
  const priority = recommendation.priority ?? index + 1;
  const effort = recommendation.effort || "medium";
  const title = recommendation.title || "Recommendation";
  const description = recommendation.description || "No description available";
  const expectedImpact = recommendation.expectedImpact ?? 0;
  const reasoning = recommendation.reasoning || "Based on data analysis";
  const actionItems = recommendation.actionItems || [];
  const timeframe = recommendation.timeframe || "TBD";

  const categoryColor = getCategoryColor(category);
  const effortInfo = getEffortLabel(effort);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Priority Badge */}
      <Box
        sx={{
          position: "absolute",
          top: -12,
          left: 16,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: categoryColor,
          color: "white",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        <StarIcon sx={{ fontSize: 14 }} />#{priority}
      </Box>

      <CardContent sx={{ pt: 4, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              backgroundColor: alpha(categoryColor, 0.1),
              color: categoryColor,
            }}
          >
            {getCategoryIcon(category)}
          </Avatar>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={effortInfo.label}
              size="small"
              color={effortInfo.color as any}
              variant="outlined"
            />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>

        {/* Expected Impact */}
        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(categoryColor, 0.05),
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Expected Impact
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: categoryColor }}
            >
              {formatCurrency(expectedImpact)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((expectedImpact / 1000000) * 100, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(categoryColor, 0.1),
              "& .MuiLinearProgress-bar": {
                backgroundColor: categoryColor,
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Reasoning */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            p: 1.5,
            backgroundColor: "action.hover",
            borderRadius: 1,
            fontStyle: "italic",
            mb: 2,
          }}
        >
          💡 {reasoning}
        </Typography>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Action Items
            </Typography>
            <List dense disablePadding>
              {actionItems.slice(0, 3).map((item, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon
                      sx={{ fontSize: 16, color: "success.main" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Timeframe */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <SpeedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            Timeframe: {timeframe}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  data,
  loading,
}) => {
  if (loading || !data) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={32} />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Safe access with defaults
  const recommendations = data.recommendations || [];
  const dataFreshness = data.dataFreshness || "Unknown";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Recommended Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-generated recommendations based on current data • Updated{" "}
            {dataFreshness}
          </Typography>
        </Box>
        <Chip
          icon={<LightbulbIcon />}
          label={`${recommendations.length} Actions`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {recommendations.length > 0 ? (
        <Grid container spacing={3}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} md={4} key={rec.id || `rec-${index}`}>
              <RecommendationCard recommendation={rec} index={index} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              No recommendations available at this time
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RecommendationsSection;
