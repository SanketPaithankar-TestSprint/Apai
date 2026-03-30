"use client"

import { useState, useEffect } from "react"
import { callRequestService } from "@/services/call-request-service"
import { CallRequest } from "@/types/call-request"
import { EmptyState } from "@/components/EmptyState"
import { 
  Search, 
  Calendar, 
  Phone, 
  Clock, 
  Store, 
  CheckCircle2,
  XCircle,
  PlayCircle,
  Loader2,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  Copy,
  ClipboardCheck,
  MoreVertical,
  Eye,
  Check,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function CallRequestsTab() {
  const [requests, setRequests] = useState<CallRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("")
  
  const [selectedRequest, setSelectedRequest] = useState<CallRequest | null>(null)
  const [newAdminNotes, setNewAdminNotes] = useState("")
  const [updatingNotes, setUpdatingNotes] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await callRequestService.getCallRequests({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        date: dateFilter || undefined
      })
      
      const requestsList = Array.isArray(data) 
        ? data 
        : (data as any).data || (data as any).requests || []
        
      setRequests(requestsList)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch call requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, dateFilter])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await callRequestService.updateStatus(id, status)
      toast.success("Status updated successfully")
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status: status as any } : null)
      }
      fetchRequests()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update status")
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedRequest) return
    try {
      setUpdatingNotes(true)
      await callRequestService.addNotes(selectedRequest.id, newAdminNotes)
      toast.success("Notes saved successfully")
      setSelectedRequest(prev => prev ? { ...prev, adminNotes: newAdminNotes } : null)
      fetchRequests()
    } catch (error) {
      console.error(error)
      toast.error("Failed to save notes")
    } finally {
      setUpdatingNotes(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 font-bold', icon: Calendar }
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: 'bg-amber-100 text-amber-700 font-bold', icon: PlayCircle }
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 font-bold', icon: CheckCircle2 }
      case 'NO_ANSWER':
        return { label: 'No Answer', color: 'bg-red-100 text-red-700 font-bold', icon: AlertCircle }
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-slate-100 text-slate-700 font-bold', icon: XCircle }
      default:
        return { label: status, color: 'bg-muted text-muted-foreground font-bold', icon: Calendar }
    }
  }

  const filteredRequests = (Array.isArray(requests) ? requests : []).filter(r => 
    r.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone?.includes(searchQuery)
  )

  return (
    <div className="space-y-4">
      {/* Search & Filters (Compacted) */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-none border-2"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 rounded-none border-2 font-bold text-[10px] uppercase">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="NO_ANSWER">No Answer</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          type="date" 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-[150px] h-9 rounded-none border-2 text-[10px] uppercase font-bold"
        />

        <Button onClick={fetchRequests} disabled={loading} variant="outline" size="icon" className="h-9 w-9 min-w-[36px] rounded-none border-2">
          <Loader2 className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* TABLE VIEW */}
      <div className="border border-border rounded-none overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-10">Notify</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Business Details</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Owner</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Contact</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Scheduled</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Status</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Loading requests...</p>
                  </div>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState 
                    title="No Call Requests"
                    description="There are no call requests matching your current filters. Try adjusting your search or status."
                    className="border-none bg-transparent py-20"
                  />
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const status = getStatusConfig(request.status);
                const showIndicator = request.status === 'SCHEDULED' || request.status === 'IN_PROGRESS';
                
                return (
                  <tr key={request.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      {showIndicator ? (
                        <div className="flex justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/10" title="Action Pending" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                           <div className="w-2 h-2 rounded-full bg-transparent" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                            {request.businessName?.charAt(0) || "B"}
                         </div>
                         <div className="font-bold text-sm tracking-tight truncate max-w-[150px]" title={request.businessName}>
                            {request.businessName}
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                       {request.ownerName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                         <div className="font-bold flex items-center gap-1.5">
                            <span className="text-xs">{request.phone}</span>
                            <button 
                              onClick={() => handleCopy(request.phone, request.id)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                               {copiedId === request.id ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div className="flex flex-col">
                          <span className="font-bold text-xs">{request.preferredDate}</span>
                          <span className="text-[10px] text-muted-foreground">At {request.preferredTime}</span>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("rounded-lg px-2 py-0 text-[10px] h-5 w-fit border-none", status.color)}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground"
                          onClick={() => {
                            setSelectedRequest(request)
                            setNewAdminNotes(request.adminNotes || "")
                          }}
                        >
                           <Eye className="w-4 h-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground">
                                <MoreVertical className="w-4 h-4" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                             <div className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Update Status</div>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="rounded-lg text-xs" onClick={() => handleUpdateStatus(request.id, 'IN_PROGRESS')}>
                                <PlayCircle className="w-4 h-4 mr-2 text-amber-500" /> In Progress
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg text-xs" onClick={() => handleUpdateStatus(request.id, 'COMPLETED')}>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Mark Completed
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg text-xs" onClick={() => handleUpdateStatus(request.id, 'NO_ANSWER')}>
                                <AlertCircle className="w-4 h-4 mr-2 text-red-500" /> No Answer
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg text-xs" onClick={() => handleUpdateStatus(request.id, 'CANCELLED')}>
                                <XCircle className="w-4 h-4 mr-2 text-slate-500" /> Cancelled
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* REFINED MODAL (Consistent with Dashboard) */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden border-border/80 shadow-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="p-8 border-b bg-muted/40 shrink-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Request Details</DialogTitle>
                    {(selectedRequest?.status === 'SCHEDULED' || selectedRequest?.status === 'IN_PROGRESS') && (
                       <Badge className="bg-red-500 text-white border-none text-[10px] uppercase h-5 font-black">Active</Badge>
                    )}
                 </div>
                 <DialogDescription className="text-sm font-medium text-muted-foreground mb-0">
                    Managing call request for {selectedRequest?.businessName}
                 </DialogDescription>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Ref: {selectedRequest?.id.split('-')[0]}
                 </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 {selectedRequest && (() => {
                    const conf = getStatusConfig(selectedRequest.status);
                    const Icon = conf.icon;
                    return <Badge variant="outline" className={cn("rounded-lg text-xs h-7 px-3 border-none", conf.color)}>
                       <Icon className="w-3.5 h-3.5 mr-2" />
                       {conf.label}
                    </Badge>;
                 })()}
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-10">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b pb-2">Primary Info</h4>
                  <div className="space-y-3">
                     <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Shop Owner</p>
                       <p className="text-sm font-bold">{selectedRequest?.ownerName}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">Scheduled For</p>
                       <p className="text-sm font-bold flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> {selectedRequest?.preferredDate}
                          <span className="text-muted-foreground font-normal text-xs">at</span> {selectedRequest?.preferredTime}
                       </p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b pb-2">Direct Contact</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/60 rounded-xl border flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold">{selectedRequest?.phone}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors" onClick={() => handleCopy(selectedRequest!.phone, 'p')}>
                          <Copy className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                    {selectedRequest?.contactNumber && (
                      <div className="p-3 bg-muted/60 rounded-xl border flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <Phone className="w-4 h-4 text-muted-foreground" />
                           <span className="text-sm font-bold">{selectedRequest?.contactNumber}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors" onClick={() => handleCopy(selectedRequest!.contactNumber, 'a')}>
                           <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-6">
               <div className="bg-muted/40 p-6 rounded-2xl border border-dashed relative">
                  <h4 className="absolute -top-3 left-4 bg-muted px-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] border rounded-full py-1">
                    Customer Message
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed italic mt-2">
                    "{selectedRequest?.notes || 'No remarks provided.'}"
                  </p>
               </div>

               <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Internal Outcome Notes
                  </h4>
                  <Textarea
                    placeholder="Brief summary of discussion, concerns, or resolution..."
                    value={newAdminNotes}
                    onChange={(e) => setNewAdminNotes(e.target.value)}
                    className="min-h-[140px] rounded-2xl border-2 focus-visible:ring-primary text-sm p-4 bg-background shadow-inner resize-none transition-all"
                  />
               </div>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
             <div className="w-full sm:w-[240px]">
               <Select value={selectedRequest?.status} onValueChange={(val) => handleUpdateStatus(selectedRequest!.id, val)}>
                 <SelectTrigger className="h-10 rounded-xl bg-background text-xs font-bold w-full uppercase border shadow-sm">
                   <div className="flex items-center">
                     <SelectValue placeholder="Status" />
                   </div>
                 </SelectTrigger>
                 <SelectContent className="rounded-xl">
                    <SelectItem className="text-xs font-bold" value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem className="text-xs font-bold" value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem className="text-xs font-bold" value="COMPLETED">Completed</SelectItem>
                    <SelectItem className="text-xs font-bold" value="NO_ANSWER">No Answer</SelectItem>
                    <SelectItem className="text-xs font-bold" value="CANCELLED">Cancelled</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="flex items-center gap-3 w-full sm:w-auto">
               <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold text-xs flex-1 sm:flex-none uppercase" onClick={() => setSelectedRequest(null)}>
                 Dismiss
               </Button>
               <Button 
                 size="sm" 
                 className="h-11 px-10 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex-1 sm:flex-none"
                 onClick={handleSaveNotes}
                 disabled={updatingNotes}
               >
                 {updatingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                 Update Record
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
