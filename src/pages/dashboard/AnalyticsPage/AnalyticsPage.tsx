"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BookOpen,
  Eye,
  TrendingDown,
  TrendingUp,
  Users,
  Loader2,
  Calendar,
  Info,
  Ticket,
  PhoneCall,
  FileText
} from "lucide-react";
import { AnalyticsService } from "./analytics-service";
import { AnalyticsDashboardData } from "./analytics-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

const userGrowthConfig = {
  cumulativeUsers: {
    label: "Total Users",
    color: "hsl(var(--chart-1))",
  },
  activeUsers: {
    label: "Active Users",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const blogPerformanceConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const viewsChartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change: string | number;
  isPositive: boolean;
  icon: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="border border-border p-6 rounded-none bg-card hover:border-black transition-colors shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{typeof change === 'number' ? `${change}%` : change} from last period</span>
          </div>
        </div>
        <div className="p-3 bg-muted rounded-lg">{Icon}</div>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growthDays, setGrowthDays] = useState("30");
  const [ticketData, setTicketData] = useState<any>(null);
  const [callData, setCallData] = useState<any>(null);
  const [articleData, setArticleData] = useState<any>(null);

  const topContentData = data?.topContentByViews.map((item, index) => ({
    ...item,
    rank: (index + 1).toString(),
  })) || [];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [result, tickets, calls, articles] = await Promise.all([
          AnalyticsService.getDashboardData(parseInt(growthDays)),
          AnalyticsService.getTicketAnalytics().catch(() => null),
          AnalyticsService.getCallAnalytics().catch(() => null),
          AnalyticsService.getArticleAnalytics().catch(() => null)
        ]);
        
        setData(result);
        setTicketData(tickets);
        setCallData(calls);
        setArticleData(articles);
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [growthDays]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error || "Something went wrong"}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const userDistributionData = [
    { name: "Pro", value: data.usersByPlan.proUsers, fill: COLORS[0] },
    { name: "Basic", value: data.usersByPlan.basicUsers, fill: COLORS[1] },
    { name: "Enterprise", value: data.usersByPlan.enterpriseUsers, fill: COLORS[2] },
    { name: "Test", value: data.usersByPlan.testUsers, fill: COLORS[3] },
  ].filter(item => item.value > 0);

  const userRoleData = [
    { name: "Customers", value: data.usersByRole.user, fill: COLORS[0] },
    { name: "Shop Owners", value: data.usersByRole.shop_owner, fill: COLORS[1] },
  ].filter(item => item.value > 0);

  // Format dates for charts
  const chartData = data.growthTimeSeries.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1 border-b-2 border-black mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={growthDays} onValueChange={setGrowthDays}>
            <SelectTrigger className="w-[180px] h-9 rounded-none border-2 font-bold text-[10px] uppercase">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={data.coreMetrics.totalUsers.toLocaleString()}
          change={`${data.coreMetrics.userGrowthPercent >= 0 ? '+' : ''}${data.coreMetrics.userGrowthPercent}%`}
          isPositive={data.coreMetrics.userGrowthPercent >= 0}
          icon={<Users className="h-6 w-6 text-blue-500" />}
          description="Total number of registered users on the platform since inception."
        />
        <MetricCard
          title="Daily Active (DAU)"
          value={data.engagement.dau.toLocaleString()}
          change={`${data.engagement.dauMauRatio.toFixed(1)}% DAU/MAU`}
          isPositive={true}
          icon={<BookOpen className="h-6 w-6 text-purple-500" />}
          description="Unique users who interacted with the platform in the last 24 hours."
        />
        <MetricCard
          title="Total Views"
          value={data.usage.totalViews.toLocaleString()}
          change={`${data.usage.avgViewsPerUser.toFixed(1)} per user`}
          isPositive={true}
          icon={<Eye className="h-6 w-6 text-pink-500" />}
          description="Cumulative number of page and content views across the entire platform."
        />
      </div>

      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Help and Support Analytics</h2>
          <div className="h-[2px] flex-1 bg-muted/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-500">
          <MetricCard
            title="Support Tickets"
            value={ticketData?.total || 0}
            change={`${ticketData?.open || 0} Open`}
            isPositive={false}
            icon={<Ticket className="h-6 w-6 text-orange-500" />}
            description="Total volume of support tickets received and currently open requests."
          />
          <MetricCard
            title="Call Requests"
            value={callData?.total || 0}
            change={`${callData?.pending || 0} Pending`}
            isPositive={false}
            icon={<PhoneCall className="h-6 w-6 text-indigo-500" />}
            description="Cumulative call support requests and the current scheduling backlog."
          />
          <MetricCard
            title="Knowledge Base"
            value={articleData?.total || 0}
            change={`${articleData?.views || 0} Total Views`}
            isPositive={true}
            icon={<FileText className="h-6 w-6 text-amber-500" />}
            description="Total number of published help articles and their cumulative engagement."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border p-6 rounded-none bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">User Growth</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cumulative users vs. daily active users over the selected time period.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ChartContainer config={userGrowthConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line 
                type="monotone" 
                dataKey="cumulativeUsers" 
                stroke="var(--chart-1)" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="var(--chart-2)" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="border border-border p-6 rounded-none bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Content Performance</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Top performing blog posts. Click a bar to view the full blog.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ChartContainer config={blogPerformanceConfig} className="h-[400px] w-full">
            <BarChart 
              data={topContentData} 
              layout="vertical" 
              margin={{ left: 10, right: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="rank" 
                type="category" 
                tick={{ fontSize: 13, fontWeight: 700, fill: "var(--foreground)" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-card p-4 shadow-xl backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          Rank #{data.rank}
                        </p>
                        <p className="font-bold text-sm mb-3 max-w-[220px] leading-snug">
                          {data.title}
                        </p>
                        <div className="flex items-center gap-4 py-2 border-y border-border/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground">Views</span>
                            <span className="font-bold text-lg">{data.views.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="mt-3 text-[10px] text-primary font-bold flex items-center gap-1">
                          Click to view blog post <TrendingUp className="h-3 w-3" />
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="views" 
                fill="var(--chart-1)" 
                radius={[0, 6, 6, 0]} 
                barSize={32}
                label={{ 
                  position: 'right', 
                  fill: 'var(--foreground)', 
                  fontSize: 12, 
                  fontWeight: 600,
                  offset: 12,
                  formatter: (val: number) => val.toLocaleString()
                }}
                onClick={(data) => navigate(`/blogs/view?slug=${data.slug}`)}
                className="cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]"
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border p-6 rounded-none bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Views Trend</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Daily traffic volume across all platform pages over the selected period.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ChartContainer config={viewsChartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="views"
                fill="url(#colorViews)"
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border border-border p-6 rounded-none bg-card shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 w-full">
              <h2 className="text-sm font-semibold">User Roles</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribution of users between Customers and Shop Owners.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  customers: { label: "Customers", color: COLORS[0] },
                  shopOwners: { label: "Shop Owners", color: COLORS[1] },
                }}
                className="h-full w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`role-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex flex-col gap-2 w-full mt-4">
              {userRoleData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border p-6 rounded-none bg-card shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 w-full">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Plans</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Breakdown of users by their subscription tier (Pro, Basic, etc.).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  pro: { label: "Pro", color: COLORS[0] },
                  basic: { label: "Basic", color: COLORS[1] },
                  enterprise: { label: "Enterprise", color: COLORS[2] },
                  test: { label: "Test", color: COLORS[3] },
                }}
                className="h-full w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`plan-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex flex-col gap-2 w-full mt-4">
              {userDistributionData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border p-6 rounded-none bg-card shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Engagement & Usage Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    DAU / MAU <Info className="h-3 w-3 opacity-50" />
                  </p>
                  <p className="text-xl font-bold">{data.engagement.dauMauRatio.toFixed(1)}%</p>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Active Users: {data.engagement.dau} / {data.engagement.mau}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Proportion of monthly active users who visit daily. High ratio indicates strong habit-forming products.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    Bounce Rate <Info className="h-3 w-3 opacity-50" />
                  </p>
                  <p className="text-xl font-bold">{data.engagement.bounceRate.toFixed(1)}%</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of users who leave the platform after viewing only one page.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    Avg Session <Info className="h-3 w-3 opacity-50" />
                  </p>
                  <p className="text-xl font-bold">{data.engagement.avgSessionLengthMinutes}m</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average duration of a user session in minutes.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    Visitors <Info className="h-3 w-3 opacity-50" />
                  </p>
                  <p className="text-xl font-bold">{data.usage.uniqueVisitors.toLocaleString()}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total number of unique daily visitors based on distinct IP addresses/devices.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider flex items-center gap-1">
                    Views/User <Info className="h-3 w-3 opacity-50" />
                  </p>
                  <p className="text-xl font-bold">{data.usage.avgViewsPerUser.toFixed(1)}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average number of pages or sections viewed by a single user per session.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;

