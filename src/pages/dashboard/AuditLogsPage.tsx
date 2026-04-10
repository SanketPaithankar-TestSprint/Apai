"use client"

import { AuditLogsTab } from "./support/AuditLogsTab"

export default function AuditLogsPage() {
  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-4">
        <h1 className="text-lg font-bold tracking-tight">Audit Logs</h1>
      </div>
      
      <AuditLogsTab 
        adminId="ADMIN_SYS_001"
        adminName="System Admin"
      />
    </div>
  )
}
