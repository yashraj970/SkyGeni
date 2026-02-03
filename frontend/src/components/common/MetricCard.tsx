import React from "react";
import { Box, Card, Typography, Skeleton, alpha } from "@mui/material";
import { TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number | null;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  color = "#2563eb",
  loading = false,
}) => {
  const getTrendIcon = () => {
    if (change === undefined || change === null || change === 0) {
      return <TrendingFlat sx={{ fontSize: 16 }} />;
    }
    return change > 0 ? (
      <TrendingUp sx={{ fontSize: 16 }} />
    ) : (
      <TrendingDown sx={{ fontSize: 16 }} />
    );
  };

  const getTrendColor = () => {
    if (change === undefined || change === null || change === 0)
      return "text.secondary";
    return change > 0 ? "success.main" : "error.main";
  };

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="50%" />
      </Card>
    );
  }

  const safeChange = change ?? 0;

  return (
    <Card
      sx={{
        p: 3,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "0.75rem",
          }}
        >
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          mb: 1,
        }}
      >
        {value}
      </Typography>

      {(change !== undefined && change !== null) || subtitle ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {change !== undefined && change !== null && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: getTrendColor(),
              }}
            >
              {getTrendIcon()}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {safeChange > 0 ? "+" : ""}
                {safeChange.toFixed(1)}%
              </Typography>
            </Box>
          )}
          {changeLabel && (
            <Typography variant="caption" color="text.secondary">
              {changeLabel}
            </Typography>
          )}
          {subtitle && !changeLabel && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      ) : null}
    </Card>
  );
};

export default MetricCard;
