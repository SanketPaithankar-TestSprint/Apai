export interface CoreMetrics {
  totalUsers: number;
  activeUsers: number;
  userGrowthPercent: number;
}

export interface UsersByRole {
  user: number;
  shop_owner: number;
}

export interface UsersByPlan {
  testUsers: number;
  basicUsers: number;
  proUsers: number;
  enterpriseUsers: number;
}

export interface EngagementMetrics {
  dau: number;
  mau: number;
  dauMauRatio: number;
  avgSessionLengthMinutes: number;
  bounceRate: number;
}

export interface UsageMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgViewsPerUser: number;
}

export interface GrowthDataPoint {
  date: string;
  cumulativeUsers: number;
  activeUsers: number;
  views: number;
}

export interface TopContent {
  title: string;
  slug: string;
  views: number;
}

export interface AnalyticsDashboardData {
  coreMetrics: CoreMetrics;
  usersByRole: UsersByRole;
  usersByPlan: UsersByPlan;
  engagement: EngagementMetrics;
  usage: UsageMetrics;
  growthTimeSeries: GrowthDataPoint[];
  topContentByViews: TopContent[];
}

export interface TicketAnalytics {
  [key: string]: any;
}

export interface CallAnalytics {
  [key: string]: any;
}

export interface ArticleAnalytics {
  [key: string]: any;
}
