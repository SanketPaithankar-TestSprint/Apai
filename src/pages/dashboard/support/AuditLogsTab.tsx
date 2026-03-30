"use client"

import { useState } from "react"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { 
  Search, 
  Filter,
  Download,
  Calendar,
  User,
  FileText,
  Settings,
  ChevronDown,
  Loader2,
  Copy,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { TARGET_TYPES, AUDIT_ACTIONS, type TargetType, type AuditAction } from "@/types/audit-logs"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/EmptyState"

interface AuditLogsTabProps {
  adminId: string;
  adminName: string;
}

export function AuditLogsTab({ adminId, adminName }: AuditLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType | "all">("all")
  const [selectedAction, setSelectedAction] = useState<AuditAction | "all">("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()

  const { auditLogs, isLoading, error, exportLogs, isExporting } = useAuditLogs({
    targetTypes: selectedTargetType === "all" ? undefined : [selectedTargetType],
    actions: selectedAction === "all" ? undefined : [selectedAction],
    search: searchQuery || undefined,
    dateRange: dateRange?.from && dateRange?.to ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined
  })

  const handleExport = () => {
    exportLogs()
  }

  const getActionIcon = (action: AuditAction) => {
    if (action.includes('TICKET')) return <FileText className="w-4 h-4" />
    if (action.includes('ARTICLE')) return <FileText className="w-4 h-4" />
    if (action.includes('USER')) return <User className="w-4 h-4" />
    if (action.includes('AGENT')) return <User className="w-4 h-4" />
    if (action.includes('SYSTEM')) return <Settings className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getActionColor = (action: AuditAction) => {
    if (action.includes('CREATED')) return 'bg-green-100 text-green-700'
    if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-700'
    if (action.includes('DELETED')) return 'bg-red-100 text-red-700'
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-purple-100 text-purple-700'
    if (action.includes('STATUS_CHANGE') || action.includes('ASSIGNED')) return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters Row (Compacted) */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full max-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-none border-2"
          />
        </div>

        <Select value={selectedTargetType} onValueChange={(value) => setSelectedTargetType(value as TargetType | "all")}>
          <SelectTrigger className="w-[140px] h-9 rounded-none border-2 font-bold text-[10px] uppercase">
            <SelectValue placeholder="Target" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Targets</SelectItem>
            {Object.values(TARGET_TYPES).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAction} onValueChange={(value) => setSelectedAction(value as AuditAction | "all")}>
          <SelectTrigger className="w-[140px] h-9 rounded-none border-2 font-bold text-[10px] uppercase">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Actions</SelectItem>
            {Object.values(AUDIT_ACTIONS).map((action) => (
              <SelectItem key={action} value={action}>
                {action.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 rounded-none border-2 justify-start font-bold text-[10px] uppercase w-[160px] overflow-hidden">
              <Calendar className="mr-2 h-3.5 w-3.5 shrink-0" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <span className="truncate">{format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}</span>
                ) : (
                  format(dateRange.from, "LLL dd")
                )
              ) : (
                <span>Range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-none shadow-2xl border-2" align="end">
            <CalendarComponent
              mode="range"
              selected={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={(range) => setDateRange(range ? { from: range.from, to: range.to } : undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleExport} disabled={isExporting || auditLogs.length === 0} size="icon" className="h-9 w-9 min-w-[36px] rounded-none border-2 ml-auto" variant="outline" title="Export Logs">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* TABLE VIEW (Users Style) */}
      <div className="border border-border rounded-none overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Log Agent</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Action Taken</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Resource Type</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Resource ID</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Loading activity logs...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-red-500 font-medium whitespace-nowrap">
                  Error loading logs. Please refresh.
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState 
                    title="No Activities Logged"
                    description="No system records match your current choice of agents, targets, or actions."
                    className="border-none bg-transparent py-24"
                  />
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-none border shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                          {log.agentName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{log.agentName || 'System'}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {log.agentId.split('-')[0]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={cn("rounded-none border-none text-[10px] h-5 px-2 font-bold uppercase", getActionColor(log.action))}>
                       {log.action.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-2">
                        <span className="p-1 bg-muted rounded-none border text-muted-foreground group-hover:text-primary transition-colors">
                           {getActionIcon(log.action)}
                        </span>
                        <span className="font-bold uppercase tracking-widest text-[10px]">{log.targetType}</span>
                     </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {log.targetId}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-xs">{format(new Date(log.timestamp), 'MMM dd, yy')}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
