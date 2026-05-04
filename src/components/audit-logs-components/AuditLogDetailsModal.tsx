import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import type { SupportAuditLog } from "@/types/audit-logs"

interface AuditLogDetailsModalProps {
  log: SupportAuditLog | null;
  onClose: () => void;
}

export function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
  const formatPayload = (val: any) => {
    if (!val) return 'null';
    if (typeof val === 'string') {
      try { return JSON.stringify(JSON.parse(val), null, 2) } catch { return val }
    }
    return JSON.stringify(val, null, 2)
  }

  return (
    <Dialog open={!!log} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="w-[95vw] max-w-5xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            Detailed view of the audit log payload.
          </DialogDescription>
        </DialogHeader>
        
        {log && (
          <div className="space-y-4 text-sm mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold">Log ID:</span> {log.id}
              </div>
              <div>
                <span className="font-bold">Timestamp:</span> {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              </div>
              <div>
                <span className="font-bold">Agent Name:</span> {log.agentName || 'System'}
              </div>
              <div>
                <span className="font-bold">Action:</span> {log.action}
              </div>
              <div>
                <span className="font-bold">Target ID:</span> {log.targetId}
              </div>
              <div>
                <span className="font-bold">IP Address:</span> {log.ipAddress || 'N/A'}
              </div>
              <div className="col-span-1 md:col-span-2">
                <span className="font-bold">User Agent:</span> {log.userAgent || 'N/A'}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="font-bold">Old Value</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap font-mono max-h-[40vh] md:max-h-none overflow-y-auto">
                {formatPayload(log.oldValue)}
              </pre>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="font-bold">New Value</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs whitespace-pre-wrap font-mono max-h-[40vh] md:max-h-none overflow-y-auto">
                {formatPayload(log.newValue)}
              </pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
