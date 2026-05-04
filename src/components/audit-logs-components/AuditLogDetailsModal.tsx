import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import type { SupportAuditLog } from "@/types/audit-logs"
import { cn } from "@/lib/utils"

interface AuditLogDetailsModalProps {
  log: SupportAuditLog | null;
  onClose: () => void;
}

export function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
  const formatPayload = (val: any) => {
    if (!val || Object.keys(val).length === 0) return 'No data available';
    if (typeof val === 'string') {
      try { 
        return JSON.stringify(JSON.parse(val), null, 2) 
      } catch { 
        return val 
      }
    }
    return JSON.stringify(val, null, 2)
  }

  const detailItem = (label: string, value: any, colSpan = 1) => (
    <div className={cn(
      "flex flex-col gap-1 p-3 border border-border/60 rounded-md bg-muted/5",
      colSpan === 2 ? "md:col-span-2" : ""
    )}>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground break-all">
        {value || "N/A"}
      </span>
    </div>
  )

  return (
    <Dialog open={!!log} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            Complete system record for this action.
          </DialogDescription>
        </DialogHeader>
        
        {log && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailItem("Log ID", log.id)}
              {detailItem("Timestamp", format(new Date(log.timestamp), 'PPP p'))}
              {detailItem("Agent Name", log.agentName || 'System')}
              {detailItem("Action Type", log.action)}
              {detailItem("Target ID", log.targetId)}
              {detailItem("IP Address", log.ipAddress)}
              {detailItem("User Agent", log.userAgent, 2)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Old State
                </h3>
                <div className="relative group">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-[11px] leading-relaxed font-mono min-h-[150px] max-h-[400px] border border-slate-800 shadow-inner">
                    {formatPayload(log.oldValue)}
                  </pre>
                  <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">JSON</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  New State
                </h3>
                <div className="relative group">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-[11px] leading-relaxed font-mono min-h-[150px] max-h-[400px] border border-slate-800 shadow-inner">
                    {formatPayload(log.newValue)}
                  </pre>
                  <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">JSON</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
