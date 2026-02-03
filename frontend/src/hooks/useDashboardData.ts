import { useState, useEffect, useCallback } from "react";
import api from "../api";
import {
  SummaryData,
  DriversData,
  RiskFactorsData,
  RecommendationsData,
} from "../types";

interface DashboardData {
  summary: SummaryData | null;
  drivers: DriversData | null;
  riskFactors: RiskFactorsData | null;
  recommendations: RecommendationsData | null;
}

interface DashboardState {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  loadingStates: {
    summary: boolean;
    drivers: boolean;
    riskFactors: boolean;
    recommendations: boolean;
  };
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    data: {
      summary: null,
      drivers: null,
      riskFactors: null,
      recommendations: null,
    },
    loading: true,
    error: null,
    loadingStates: {
      summary: true,
      drivers: true,
      riskFactors: true,
      recommendations: true,
    },
  });

  const fetchAllData = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      loadingStates: {
        summary: true,
        drivers: true,
        riskFactors: true,
        recommendations: true,
      },
    }));

    const results = await Promise.allSettled([
      api.getSummary().then((data) => {
        setState((prev) => ({
          ...prev,
          data: { ...prev.data, summary: data },
          loadingStates: { ...prev.loadingStates, summary: false },
        }));
        return data;
      }),
      api.getDrivers().then((data) => {
        setState((prev) => ({
          ...prev,
          data: { ...prev.data, drivers: data },
          loadingStates: { ...prev.loadingStates, drivers: false },
        }));
        return data;
      }),
      api.getRiskFactors().then((data) => {
        setState((prev) => ({
          ...prev,
          data: { ...prev.data, riskFactors: data },
          loadingStates: { ...prev.loadingStates, riskFactors: false },
        }));
        return data;
      }),
      api.getRecommendations().then((data) => {
        setState((prev) => ({
          ...prev,
          data: { ...prev.data, recommendations: data },
          loadingStates: { ...prev.loadingStates, recommendations: false },
        }));
        return data;
      }),
    ]);

    const hasErrors = results.some((result) => result.status === "rejected");
    const errors = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      )
      .map((result) => result.reason?.message || "Unknown error");

    setState((prev) => ({
      ...prev,
      loading: false,
      error: hasErrors ? errors.join(", ") : null,
    }));
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...state,
    refetch: fetchAllData,
  };
}
