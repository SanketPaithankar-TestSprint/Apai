import { API_ENDPOINTS } from "@/constants/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { AnalyticsDashboardData } from "./analytics-types";

export const AnalyticsService = {
  async getDashboardData(growthDays = 30): Promise<AnalyticsDashboardData> {
    const url = `${API_ENDPOINTS.ANALYTICS}/dashboard?growthDays=${growthDays}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
    }
    return response.json();
  },
};
