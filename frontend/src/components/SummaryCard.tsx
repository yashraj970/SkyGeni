import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  status?: "positive" | "negative" | "neutral";
  loading?: boolean;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  status = "neutral",
  loading = false,
  icon,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="70%" height={40} />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (status) {
      case "positive":
        return "success.main";
      case "negative":
        return "error.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: "action.hover",
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
          {value}
        </Typography>

        {change !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {change >= 0 ? (
              <TrendingUp sx={{ fontSize: 18, color: "success.main" }} />
            ) : (
              <TrendingDown sx={{ fontSize: 18, color: "error.main" }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: change >= 0 ? "success.main" : "error.main",
                fontWeight: 600,
              }}
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </Typography>
            {changeLabel && (
              <Typography variant="caption" color="text.secondary">
                {changeLabel}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
