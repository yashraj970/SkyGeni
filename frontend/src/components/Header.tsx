import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

interface HeaderProps {
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            }}
          >
            <TrendingUpIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Revenue Intelligence Console
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {currentDate}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label="Q4 2024"
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
            }}
          />
          <IconButton
            onClick={onRefresh}
            sx={{ color: "text.secondary" }}
            title="Refresh Data"
          >
            <RefreshIcon />
          </IconButton>
          <IconButton sx={{ color: "text.secondary" }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: "primary.main",
              fontSize: "0.875rem",
            }}
          >
            CRO
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
