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

  async getTicketAnalytics() {
    const response = await fetchWithAuth(API_ENDPOINTS.ANALYTICS_TICKETS);
    if (!response.ok) throw new Error("Failed to fetch ticket analytics");
    return response.json();
  },

  async getCallAnalytics() {
    const response = await fetchWithAuth(API_ENDPOINTS.ANALYTICS_CALLS);
    if (!response.ok) throw new Error("Failed to fetch call analytics");
    return response.json();
  },

  async getArticleAnalytics() {
    const response = await fetchWithAuth(API_ENDPOINTS.ANALYTICS_ARTICLES);
    if (!response.ok) throw new Error("Failed to fetch article analytics");
    return response.json();
  },
};
