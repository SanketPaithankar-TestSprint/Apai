"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Search, 
  X, 
  MoreVertical, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  ArrowUpDown,
  Send,
  Paperclip,
  User,
  ShieldCheck,
  Calendar,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { ticketService } from "@/services/ticket-service"
import { Ticket, TicketMessage, InternalNote, TicketAttachment } from "@/types/ticket"
import { TICKET_PRICES } from "@/constants/ticket-pricing"

function TicketDetailsDialog({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [reply, setReply] = useState("")
  const [internalNote, setInternalNote] = useState("")

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["ticket-messages", ticket.id],
    queryFn: () => ticketService.getMessages(ticket.id),
    enabled: open,
  })

  const { data: notes = [], isLoading: loadingNotes } = useQuery({
    queryKey: ["ticket-notes", ticket.id],
    queryFn: () => ticketService.getInternalNotes(ticket.id),
    enabled: open,
  })

  const sendReplyMutation = useMutation({
    mutationFn: (msg: string) => ticketService.sendMessage(ticket.id, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticket.id] })
      setReply("")
      toast.success("Reply sent successfully")
    },
    onError: () => toast.error("Failed to send reply"),
  })

  const addNoteMutation = useMutation({
    mutationFn: (note: string) => ticketService.addInternalNote(ticket.id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-notes", ticket.id] })
      setInternalNote("")
      toast.success("Internal note added")
    },
    onError: () => toast.error("Failed to add note"),
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ticketService.updateStatus(ticket.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["ticket", ticket.id] })
      toast.success("Status updated")
    },
    onError: () => toast.error("Failed to update status"),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">{ticket.id}</span>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>
              <DialogTitle className="text-xl">{ticket.subject}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 mr-6">
                <Select 
                    defaultValue={ticket.status} 
                    onValueChange={(val) => updateStatusMutation.mutate(val)}
                    disabled={updateStatusMutation.isPending}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="messages" className="h-full flex flex-col">
            <div className="px-6 border-b border-border">
              <TabsList className="bg-transparent h-12 w-full justify-start gap-6 border-none">
                <TabsTrigger value="messages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Internal Notes
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">
                    <Eye className="w-4 h-4 mr-2" />
                    Description
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="messages" className="flex-1 flex flex-col m-0 overflow-hidden">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {loadingMessages ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">No messages yet.</div>
                  ) : (
                    messages.map((msg: TicketMessage) => (
                      <div key={msg.id} className={`flex flex-col ${msg.admin ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.admin ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none border border-border"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold">{msg.senderName}</span>
                            {msg.admin && <Badge className="bg-white/20 text-white border-white/30 text-[9px] h-4">Admin</Badge>}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="p-6 border-t border-border bg-muted/10">
                <div className="relative">
                  <Textarea 
                    placeholder="Type your reply..." 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="min-h-[100px] pr-12 resize-none"
                  />
                  <Button 
                    size="icon" 
                    className="absolute bottom-3 right-3 rounded-full"
                    disabled={!reply.trim() || sendReplyMutation.isPending}
                    onClick={() => sendReplyMutation.mutate(reply)}
                  >
                    {sendReplyMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 flex flex-col m-0 overflow-hidden">
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                    {loadingNotes ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : notes.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground italic">No internal notes for this ticket.</div>
                    ) : (
                        notes.map((note: InternalNote) => (
                        <div key={note.id} className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                                    <span className="text-xs font-bold text-amber-900">{note.agentName}</span>
                                </div>
                                <span className="text-[10px] text-amber-600">{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-amber-800">{note.noteContent}</p>
                        </div>
                        ))
                    )}
                    </div>
                </ScrollArea>
                <div className="p-6 border-t border-border bg-amber-50/30">
                    <div className="relative">
                        <Textarea 
                            placeholder="Add internal note (only visible to team)..." 
                            value={internalNote}
                            onChange={(e) => setInternalNote(e.target.value)}
                            className="border-amber-200 focus-visible:ring-amber-400 min-h-[80px] resize-none"
                        />
                        <Button 
                            className="mt-2 w-full bg-amber-600 hover:bg-amber-700"
                            disabled={!internalNote.trim() || addNoteMutation.isPending}
                            onClick={() => addNoteMutation.mutate(internalNote)}
                        >
                            {addNoteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Add Internal Note
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="details" className="flex-1 p-6 m-0 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Issue Description</h4>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>
                
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Attachments ({ticket.attachments.length})</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {ticket.attachments.map((file: TicketAttachment) => (
                        <a 
                          key={file.attachmentId} 
                          href={file.s3Url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <Paperclip className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{file.originalFileName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{file.fileExtension.replace('.','')}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center"><User className="w-4 h-4 mr-2" /> Agent</span>
                            <span className="font-medium">Unassigned</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center font-bold text-primary">Price</span>
                            <span className="font-bold text-primary">${TICKET_PRICES[ticket.category].toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2" /> Created</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Priority</span>
                            <Badge variant="outline" className={
                                ticket.priority === 'URGENT' ? 'bg-red-50 text-red-700 border-red-200' :
                                ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-slate-50 text-slate-700'
                            }>{ticket.priority}</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground flex items-center"><Clock className="w-4 h-4 mr-2" /> Last Update</span>
                            <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TicketsTab() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [page, setPage] = useState(0)
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", statusFilter, priorityFilter, searchQuery, page],
    queryFn: () => ticketService.getTickets({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
        page: page,
        limit: 10
    }),
  })

  const tickets = data?.content || []
  const totalElements = data?.totalElements || 0
  const totalPages = data?.totalPages || 0

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ticketService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      toast.success("Ticket status updated")
    },
    onError: () => toast.error("Failed to update status"),
  })

  const getStatusBadge = (status: Ticket["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200">Open</Badge>
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-amber-100/50 text-amber-700 border-amber-200">In Progress</Badge>
      case "RESOLVED":
        return <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-200">Resolved</Badge>
      case "CLOSED":
        return <Badge variant="outline" className="bg-slate-100/50 text-slate-700 border-slate-200">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "URGENT":
        return <Badge className="bg-red-600 hover:bg-red-600">Urgent</Badge>
      case "HIGH":
        return <Badge variant="outline" className="bg-orange-100/50 text-orange-700 border-orange-200">High</Badge>
      case "MEDIUM":
        return <Badge variant="outline" className="bg-yellow-100/50 text-yellow-700 border-yellow-200">Medium</Badge>
      case "LOW":
        return <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 shadow-inner">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by subject, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
          <SelectTrigger className="h-11 bg-background rounded-lg">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val); setPage(0); }}>
          <SelectTrigger className="h-11 bg-background rounded-lg">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priorities</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading tickets...</div>
        ) : error ? (
            <div className="p-20 text-center text-destructive">Failed to load tickets. Please try again.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Ticket</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Subject</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Price</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Priority</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground">Created</th>
                  <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                      <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                        {ticket.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 max-w-[300px]">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground truncate block">
                            {ticket.subject}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ticket.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-primary">
                        ${TICKET_PRICES[ticket.category].toFixed(2)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => updateStatusMutation.mutate({ id: ticket.id, status: "RESOLVED" })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-amber-600"
                                onClick={() => updateStatusMutation.mutate({ id: ticket.id, status: "IN_PROGRESS" })}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Set In Progress
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No tickets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {!isLoading && !error && (
            <div className="bg-muted/20 px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Showing <span className="text-foreground font-medium">{tickets.length}</span> of <span className="text-foreground font-medium">{totalElements}</span> tickets
                </p>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="text-xs h-8"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center px-2 text-xs font-medium">
                        Page {page + 1} of {totalPages || 1}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="text-xs h-8"
                    >
                        Next
                    </Button>
                </div>
            </div>
        )}
      </div>

      {selectedTicket && (
        <TicketDetailsDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
        />
      )}
    </div>
  )
}
