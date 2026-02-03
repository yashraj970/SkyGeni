import React from "react";
import { Box, Alert, AlertTitle, Button, Divider } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useDashboardData } from "../hooks/useDashboardData";
import SummarySection from "./SummarySection";
import DriversSection from "./DriversSection";
import RiskFactorsSection from "./RiskFactorsSection";
import RecommendationsSection from "./RecommendationsSection";
import LoadingSpinner from "./common/LoadingSpinner";

const Dashboard: React.FC = () => {
  const { data, loading, error, loadingStates, refetch } = useDashboardData();

  if (
    loading &&
    !data.summary &&
    !data.drivers &&
    !data.riskFactors &&
    !data.recommendations
  ) {
    return <LoadingSpinner message="Loading dashboard data..." fullHeight />;
  }

  if (error && !data.summary) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refetch}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Summary Section */}
      <SummarySection data={data.summary} loading={loadingStates.summary} />

      <Divider />

      {/* Revenue Drivers */}
      <DriversSection data={data.drivers} loading={loadingStates.drivers} />

      <Divider />

      {/* Risk Factors */}
      <RiskFactorsSection
        data={data.riskFactors}
        loading={loadingStates.riskFactors}
      />

      <Divider />

      {/* Recommendations */}
      <RecommendationsSection
        data={data.recommendations}
        loading={loadingStates.recommendations}
      />
    </Box>
  );
};

export default Dashboard;
