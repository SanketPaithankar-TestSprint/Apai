"use client"

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Users, BookOpen, Eye } from "lucide-react"

// Dummy data
const userGrowthData = [
  { month: "Jan", users: 400, activeUsers: 240 },
  { month: "Feb", users: 520, activeUsers: 320 },
  { month: "Mar", users: 680, activeUsers: 420 },
  { month: "Apr", users: 890, activeUsers: 580 },
  { month: "May", users: 1100, activeUsers: 750 },
  { month: "Jun", users: 1234, activeUsers: 890 },
]

const blogPerformanceData = [
  { name: "Tech Tips", views: 4200, likes: 240 },
  { name: "Design Guide", views: 3800, likes: 221 },
  { name: "Dev Tools", views: 2800, likes: 229 },
  { name: "Best Practices", views: 2390, likes: 200 },
  { name: "Web 3.0", views: 2290, likes: 180 },
]

const userDistributionData = [
  { name: "Free Plan", value: 450 },
  { name: "Pro Plan", value: 600 },
  { name: "Enterprise", value: 184 },
]

const viewsData = [
  { date: "Jan 1", views: 1200, uniqueVisitors: 800 },
  { date: "Jan 8", views: 1800, uniqueVisitors: 1200 },
  { date: "Jan 15", views: 2400, uniqueVisitors: 1600 },
  { date: "Jan 22", views: 2210, uniqueVisitors: 1500 },
  { date: "Jan 29", views: 2290, uniqueVisitors: 1800 },
  { date: "Feb 5", views: 3200, uniqueVisitors: 2200 },
  { date: "Feb 12", views: 3890, uniqueVisitors: 2800 },
]

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899"]

// Chart configs
const userGrowthConfig = {
  users: {
    label: "Total Users",
    color: "hsl(var(--chart-1))",
  },
  activeUsers: {
    label: "Active Users",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const blogPerformanceConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const viewsChartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  uniqueVisitors: {
    label: "Unique Visitors",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
}) {
  return (
    <div className="border border-border p-6 rounded-lg bg-card hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{change} from last month</span>
          </div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          {Icon}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your performance overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value="1,234"
          change="+12.5%"
          isPositive={true}
          icon={<Users className="h-6 w-6 text-blue-500" />}
        />
        <MetricCard
          title="Total Blogs"
          value="56"
          change="+8.2%"
          isPositive={true}
          icon={<BookOpen className="h-6 w-6 text-purple-500" />}
        />
        <MetricCard
          title="Total Views"
          value="12,456"
          change="+23.1%"
          isPositive={true}
          icon={<Eye className="h-6 w-6 text-pink-500" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="border border-border p-6 rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <ChartContainer config={userGrowthConfig}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="users" strokeWidth={2} />
              <Line type="monotone" dataKey="activeUsers" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Blog Performance Chart */}
        <div className="border border-border p-6 rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">Top Blogs Performance</h2>
          <ChartContainer config={blogPerformanceConfig}>
            <BarChart data={blogPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="views" fill="var(--chart-1)" />
              <Bar dataKey="likes" fill="var(--chart-2)" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Bottom Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="border border-border p-6 rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">Views Over Time</h2>
          <ChartContainer config={viewsChartConfig}>
            <AreaChart data={viewsData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="views" fill="url(#colorViews)" stroke="var(--chart-1)" strokeWidth={2} />
              <Area type="monotone" dataKey="uniqueVisitors" fill="url(#colorVisitors)" stroke="var(--chart-2)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* User Plan Distribution */}
        <div className="border border-border p-6 rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">User Plan Distribution</h2>
          <ChartContainer config={{ freePlan: { label: "Free Plan", color: "hsl(var(--chart-1))" }, proPlan: { label: "Pro Plan", color: "hsl(var(--chart-2))" }, enterprise: { label: "Enterprise", color: "hsl(var(--chart-3))" } }} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex justify-center gap-6 mt-4">
            {userDistributionData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border border-border p-6 rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-6">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg. Session Length</p>
            <p className="text-2xl font-bold">4m 32s</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bounce Rate</p>
            <p className="text-2xl font-bold">32.4%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold">8.2%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg. Views per User</p>
            <p className="text-2xl font-bold">3.4</p>
          </div>
        </div>
      </div>
    </div>
  )
}
