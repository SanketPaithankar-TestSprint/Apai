"use client"

import { useState, useEffect, useRef } from "react"
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
  Clock,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { AuditLogDetailsModal } from "@/components/audit-logs-components/AuditLogDetailsModal"
import { format } from "date-fns"
import { TARGET_TYPES, AuditAction, type TargetType, type SupportAuditLog } from "@/types/audit-logs"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/EmptyState"

interface AuditLogsTabProps {
  adminId: string;
  adminName: string;
  fixedTargetType?: TargetType;
}

export function AuditLogsTab({ adminId, adminName, fixedTargetType }: AuditLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType | "all">(fixedTargetType || "all")
  const [selectedAction, setSelectedAction] = useState<AuditAction | "all">("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()
  const [selectedLog, setSelectedLog] = useState<SupportAuditLog | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { auditLogs, isLoading, error, exportLogs, isExporting, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditLogs({
    targetTypes: selectedTargetType === "all" ? undefined : [selectedTargetType],
    actions: selectedAction === "all" ? undefined : [selectedAction],
    search: searchQuery || undefined,
    dateRange: dateRange?.from && dateRange?.to ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])



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

        {!fixedTargetType && (
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
        )}

        <Select value={selectedAction} onValueChange={(value) => setSelectedAction(value as AuditAction | "all")}>
          <SelectTrigger className="w-[140px] h-9 rounded-none border-2 font-bold text-[10px] uppercase">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">All Actions</SelectItem>
            {Object.values(AuditAction).map((action) => (
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

        <div className="ml-auto flex items-center gap-2">
          <Button 
            disabled={isExporting || auditLogs.length === 0} 
            size="sm" 
            className="h-9 rounded-none border-2 font-bold text-[10px] uppercase gap-2" 
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export JSON
          </Button>
        </div>
      </div>

      {/* TABLE VIEW (Users Style) */}
      <div className="border border-border rounded-none overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Log Agent</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Action Taken</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Resource ID</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Timestamp</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">View</th>
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
            ) : (error || auditLogs.length === 0) ? (
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
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {String(log.agentId).split('-')[0]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline" className={cn("rounded-none border-none text-[10px] h-5 px-2 font-bold uppercase", getActionColor(log.action as AuditAction))}>
                         {(log.action as string).replace('_', ' ')}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {log.targetId}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xs">{format(new Date(log.timestamp), 'MMM dd, yy')}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)} title="View Details">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div ref={loadMoreRef} className="py-4 flex justify-center text-xs font-medium text-muted-foreground">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading older logs...</span>
          </div>
        ) : !hasNextPage && auditLogs.length > 0 ? (
          "You've reached the end of the logs"
        ) : null}
      </div>

      {/* Export Config Modal */}
      <ExportAuditLogsModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={exportLogs}
        isExporting={isExporting}
      />

      <AuditLogDetailsModal 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  )
}

function ExportAuditLogsModal({
  open,
  onOpenChange,
  onExport,
  isExporting
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (fields: (keyof SupportAuditLog)[]) => void
  isExporting: boolean
}) {
  const [selectedFields, setSelectedFields] = useState<(keyof SupportAuditLog)[]>([
    'id', 'timestamp', 'agentId', 'agentName', 'action', 'targetType', 'targetId', 'ipAddress', 'userAgent', 'oldValue', 'newValue'
  ])

  const fields: { label: string, value: keyof SupportAuditLog }[] = [
    { label: "Log ID", value: "id" },
    { label: "Timestamp", value: "timestamp" },
    { label: "Agent ID", value: "agentId" },
    { label: "Agent Name", value: "agentName" },
    { label: "Action Taken", value: "action" },
    { label: "Target Type", value: "targetType" },
    { label: "Target ID", value: "targetId" },
    { label: "IP Address", value: "ipAddress" },
    { label: "User Agent", value: "userAgent" },
    { label: "Old State (JSON)", value: "oldValue" },
    { label: "New State (JSON)", value: "newValue" },
  ]

  const toggleField = (field: keyof SupportAuditLog) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field))
    } else {
      setSelectedFields([...selectedFields, field])
    }
  }

  const handleSelectAll = () => {
    if (selectedFields.length === fields.length) {
      setSelectedFields([])
    } else {
      setSelectedFields(fields.map(f => f.value))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-2">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic">Export Configuration</DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Select the parameters you want to include in the JSON export.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Log Parameters</span>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase underline" onClick={handleSelectAll}>
              {selectedFields.length === fields.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`field-${field.value}`} 
                  checked={selectedFields.includes(field.value)}
                  onCheckedChange={() => toggleField(field.value)}
                  className="rounded-none border-2"
                />
                <label 
                  htmlFor={`field-${field.value}`}
                  className="text-[11px] font-bold uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" className="rounded-none border-2 font-bold uppercase text-[10px]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            disabled={selectedFields.length === 0 || isExporting}
            className="rounded-none border-2 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
            onClick={() => {
              onExport(selectedFields)
              onOpenChange(false)
            }}
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Download className="w-3.5 h-3.5 mr-2" />}
            Confirm Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
