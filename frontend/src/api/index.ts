import axios, { AxiosInstance, AxiosError } from "axios";
import {
  SummaryData,
  DriversData,
  RiskFactorsData,
  RecommendationsData,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage =
      error.response?.data || error.message || "An error occurred";
    console.error("API Error:", errorMessage);
    return Promise.reject(error);
  },
);

export const api = {
  getSummary: async (): Promise<SummaryData> => {
    const response = await apiClient.get<SummaryData>("/api/summary");
    return response.data;
  },

  getDrivers: async (): Promise<DriversData> => {
    const response = await apiClient.get<DriversData>("/api/drivers");
    return response.data;
  },

  getRiskFactors: async (): Promise<RiskFactorsData> => {
    const response = await apiClient.get<RiskFactorsData>("/api/risk-factors");
    return response.data;
  },

  getRecommendations: async (): Promise<RecommendationsData> => {
    const response = await apiClient.get<RecommendationsData>(
      "/api/recommendations",
    );
    return response.data;
  },
};

export default api;
