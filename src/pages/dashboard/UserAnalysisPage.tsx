"use client"

import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  Laptop,
  Loader2,
  LogIn,
  Shield,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_ENDPOINTS } from "@/constants/api"
import { fetchWithAuth } from "@/lib/fetchWithAuth"

interface SessionInfo {
  loginTime: string | null
  logoutTime: string | null
}

interface UserActivityAnalysis {
  userId: number
  email: string
  totalLogins: number
  activeSessions: number
  avgSessionDurationMinutes: number
  lastLoginTime: string | null
  primaryDeviceType: string | null
  uniqueIpsUsed: number
  totalDocumentsCreated: number
  avgDocumentsPerDay: number
  documentTypeBreakdown: Record<string, number>
  securityEventsCount: number
  securityEventSeverityBreakdown: Record<string, number>
  daysSinceJoined: number
  activeDaysCount: number
  timeRangeDays: number
  onlineSessions: SessionInfo[]
}

interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
  timestamp?: string
}

const dayOptions = ["7", "14", "30", "60", "90"]

function formatDateTime(value: string | null) {
  if (!value) return "N/A"
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatNumber(value: number | null | undefined) {
  return typeof value === "number" ? value.toLocaleString() : "0"
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity
  label: string
  value: string
  detail?: string
}) {
  return (
    <Card className="rounded-none gap-3 py-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-2xl font-bold">{value}</div>
        {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
      </CardContent>
    </Card>
  )
}

function BreakdownList({
  title,
  items,
  emptyText,
}: {
  title: string
  items: Record<string, number>
  emptyText: string
}) {
  const entries = Object.entries(items || {})
  const maxValue = Math.max(...entries.map(([, value]) => value), 1)

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{key.replaceAll("_", " ")}</span>
                <span className="text-muted-foreground">{formatNumber(value)}</span>
              </div>
              <div className="h-2 bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.max((value / maxValue) * 100, value > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function UserAnalysisPage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [days, setDays] = useState("7")
  const numericUserId = Number(userId)

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-analysis", numericUserId, days],
    enabled: Number.isFinite(numericUserId),
    queryFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_ANALYSIS(numericUserId, Number(days)))
      if (!response.ok) {
        throw new Error("Failed to fetch user analysis")
      }

      const payload = (await response.json()) as ApiResponse<UserActivityAnalysis> | UserActivityAnalysis
      return "data" in payload && payload.data ? payload.data : payload as UserActivityAnalysis
    },
  })

  const sessionRows = useMemo(() => data?.onlineSessions || [], [data])

  if (!Number.isFinite(numericUserId)) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/users")} className="rounded-none">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive">
          Invalid user id.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/users")} className="h-9 rounded-none border-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">User Analytics</h1>
            <p className="text-xs text-muted-foreground">
              {data?.email || `User ID ${numericUserId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Range</span>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="h-9 w-[120px] rounded-none border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-none border border-destructive/20">
          {error instanceof Error ? error.message : "Failed to load user analytics"}
        </div>
      )}

      {data && !isLoading && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">User #{data.userId}</Badge>
            <Badge variant={data.activeSessions > 0 ? "default" : "secondary"}>
              {data.activeSessions > 0 ? "Active Session" : "No Active Session"}
            </Badge>
            <Badge variant="outline">{data.timeRangeDays} Day Window</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard icon={LogIn} label="Total Logins" value={formatNumber(data.totalLogins)} detail={`Last login: ${formatDateTime(data.lastLoginTime)}`} />
            <MetricCard icon={Clock} label="Avg Session" value={`${formatNumber(data.avgSessionDurationMinutes)} min`} detail={`${formatNumber(data.uniqueIpsUsed)} unique IPs`} />
            <MetricCard icon={FileText} label="Documents" value={formatNumber(data.totalDocumentsCreated)} detail={`${data.avgDocumentsPerDay.toFixed(2)} per day`} />
            <MetricCard icon={Activity} label="Active Days" value={formatNumber(data.activeDaysCount)} detail={`${formatNumber(data.daysSinceJoined)} days since joined`} />
            <MetricCard icon={Users} label="Active Sessions" value={formatNumber(data.activeSessions)} />
            <MetricCard icon={Laptop} label="Primary Device" value={data.primaryDeviceType || "N/A"} />
            <MetricCard icon={Shield} label="Security Events" value={formatNumber(data.securityEventsCount)} />
            <MetricCard icon={AlertTriangle} label="Online Sessions" value={formatNumber(sessionRows.length)} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <BreakdownList
              title="Document Type Breakdown"
              items={data.documentTypeBreakdown}
              emptyText="No documents created in this window."
            />
            <BreakdownList
              title="Security Severity Breakdown"
              items={data.securityEventSeverityBreakdown}
              emptyText="No security events in this window."
            />
          </div>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Online Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No online sessions for this user.</p>
              ) : (
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">Login Time</th>
                        <th className="px-3 py-2 text-left font-medium">Logout Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionRows.map((session, index) => (
                        <tr key={`${session.loginTime}-${index}`} className="border-b last:border-b-0">
                          <td className="px-3 py-2">{formatDateTime(session.loginTime)}</td>
                          <td className="px-3 py-2">{formatDateTime(session.logoutTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
