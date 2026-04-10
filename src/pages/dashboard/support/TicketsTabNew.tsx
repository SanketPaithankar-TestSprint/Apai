"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_ENDPOINTS } from "@/constants/api";
import { useAdminSupportChat } from "@/hooks/useAdminSupportChat";
import { 
  Search, 
  Loader2, 
  Users,
  ArrowLeft,
  X,
  HelpCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedConversation } from "@/types/unified-chat";
// Since UnifiedConversation may not have userId yet, let's extend it or cast it later.
interface ExtendedConversation extends UnifiedConversation {
  userId?: number;
}
import { ticketService } from "@/services/ticket-service";
import { EmptyState } from "@/components/EmptyState";


interface TicketsTabProps {
  adminId: string;
  token: string;
}

export function TicketsTab({ adminId, token }: TicketsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [noteText, setNoteText] = useState("");
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isTicketLoading, setIsTicketLoading] = useState(false);

  const {
    activeConversationId,
    messages,
    selectConversation,
    sendMessage
  } = useAdminSupportChat({ adminId, token });

  const conversations = tickets.map(t => ({
    ...t,
    visitorName: t.subject || `User #${t.userId}`, // Fallback for UI
    type: 'ticket' 
  })) as ExtendedConversation[];

  const fetchTickets = useCallback(async () => {
    setIsTicketsLoading(true);
    try {
      const response = await ticketService.getTickets({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        priority: priorityFilter === "ALL" ? undefined : priorityFilter,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 10
      });
      setTickets(response.content || []);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsTicketsLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const fetchUserData = async () => {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      const userId = activeConv?.userId;
      
      if (userId) {
        setIsUserLoading(true);
        try {
          const response = await fetchWithAuth(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            const allUsersRes = await fetchWithAuth(API_ENDPOINTS.ADMIN_USERS);
            if (allUsersRes.ok) {
              const allUsers = await allUsersRes.json();
              const found = (allUsers.content || allUsers).find((u: any) => u.userId === userId);
              setUserData(found);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user metadata:", error);
        } finally {
          setIsUserLoading(false);
        }
      } else {
        setUserData(null);
      }
    };

    if (activeConversationId) {
      fetchUserData();
    }
  }, [activeConversationId, conversations]);

  // Fetch internal notes for the specific ticket
  useEffect(() => {
    const fetchNotes = async () => {
      if (activeConversationId) {
        setIsNotesLoading(true);
        try {
          const notes = await ticketService.getInternalNotes(activeConversationId);
          setInternalNotes(notes);
        } catch (error) {
          console.error("Failed to fetch internal notes:", error);
        } finally {
          setIsNotesLoading(false);
        }
      } else {
        setInternalNotes([]);
      }
    };

    fetchNotes();
  }, [activeConversationId]);

  // Fetch detailed ticket info
  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (activeConversationId) {
        setIsTicketLoading(true);
        try {
          const detail = await ticketService.getTicket(activeConversationId);
          setSelectedTicket(detail);
        } catch (error) {
          console.error("Failed to fetch ticket details:", error);
        } finally {
          setIsTicketLoading(false);
        }
      } else {
        setSelectedTicket(null);
      }
    };

    fetchTicketDetails();
  }, [activeConversationId]);


  const handleUpdateStatus = async (newStatus: "OPEN" | "CLOSED" | "IN_PROGRESS") => {
    if (!activeConversationId) return;
    setIsStatusUpdating(true);
    try {
      await ticketService.updateStatus(activeConversationId, newStatus);
      fetchTickets(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !activeConversationId) return;
    try {
      const newNote = await ticketService.addInternalNote(activeConversationId, noteText);
      setInternalNotes(prev => [newNote, ...prev]);
      setNoteText("");
    } catch (error) {
      console.error("Failed to add internal note:", error);
    }
  };




  // No need for filteredConversations as filtering is done on the server


  const handleBack = () => {
    selectConversation(null);
  };

  const handleSendMessage = (message: string) => {
    if (message.trim() && activeConversationId) {
      sendMessage(message);
      setMessageText("");
    }
  };

  return (
    <div className="w-full">
      {!activeConversationId ? (
        /* TICKETS LIST VIEW */
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-full max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subject, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 rounded-xl border-border bg-card shadow-sm"
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

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] h-9 rounded-xl border-border bg-card shadow-sm font-bold text-[10px] uppercase">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 rounded-xl border-border bg-card shadow-sm font-bold text-[10px] uppercase">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-300">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Customer</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest hidden md:table-cell">Platform ID</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">Priority</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Subject</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isTicketsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin h-8 w-8 text-primary/60" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Fetching tickets...</span>
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <EmptyState 
                        title="No Tickets Found"
                        description="There are currently no support tickets or chat requests matching your criteria."
                        className="border-none bg-transparent py-32"
                      />
                    </td>
                  </tr>
                ) : (
                  tickets.map((conversation) => (
                    <tr
                      key={conversation.id}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                      onClick={() => selectConversation(conversation.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 rounded-full border border-border shrink-0 shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-black rounded-full uppercase">
                              {conversation.visitorName?.charAt(0) || conversation.userId?.toString().charAt(0) || "T"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">
                              {conversation.visitorName || `User #${conversation.userId}`}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-[10px] font-mono opacity-50 bg-muted px-2 py-0.5 rounded border border-border/50">
                          {conversation.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className={cn(
                          "rounded-md border-none font-bold text-[9px] uppercase tracking-tighter px-2",
                          conversation.priority === 'URGENT' ? "bg-red-100 text-red-600" :
                          conversation.priority === 'HIGH' ? "bg-orange-100 text-orange-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          {conversation.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px] font-medium opacity-80">
                          {conversation.subject || conversation.description || "No subject content"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Select 
                          value={conversation.status} 
                          onValueChange={(val: any) => {
                            selectConversation(conversation.id); // Also select it
                            handleUpdateStatus(val);
                          }}
                        >
                          <SelectTrigger className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest h-7 border-none shadow-none",
                            conversation.status === "OPEN" ? "bg-green-100 text-green-700" : 
                            conversation.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-500"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              conversation.status === "OPEN" ? "bg-green-500" : 
                              conversation.status === "IN_PROGRESS" ? "bg-blue-500" :
                              "bg-slate-400"
                            )} />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold text-[10px] uppercase">
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 rounded-full p-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CHAT VIEW — Clean Two-Panel Layout */
        <div className="flex h-[calc(100vh-12rem)] border border-border rounded-xl overflow-hidden bg-background animate-in fade-in duration-300">
          
          {/* ═══════ LEFT: Chat Column ═══════ */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* ─── Chat Header ─── */}
            <div className="h-14 border-b border-border px-5 flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-3">
                <Button onClick={handleBack} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                      {userData?.ownerName?.charAt(0) || conversations.find(c => c.id === activeConversationId)?.visitorName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold leading-none">
                      {userData?.ownerName || conversations.find(c => c.id === activeConversationId)?.visitorName || "Support Thread"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status dropdown in header */}
                <Select 
                  value={conversations.find(c => c.id === activeConversationId)?.status} 
                  onValueChange={(val: any) => handleUpdateStatus(val)}
                >
                  <SelectTrigger className={cn(
                    "h-7 w-auto rounded-full text-[10px] font-bold uppercase border-none px-3 gap-1.5",
                    conversations.find(c => c.id === activeConversationId)?.status === "OPEN" 
                      ? "bg-green-100 text-green-700" 
                      : conversations.find(c => c.id === activeConversationId)?.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Dossier modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-card rounded-2xl border-border shadow-2xl p-0 overflow-hidden">
                    <div className="p-8 space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-bold tracking-tight mb-1">Case Dossier</h2>
                          <p className="text-xs text-muted-foreground">{activeConversationId}</p>
                        </div>
                        <Badge className={cn(
                          "rounded-full text-[10px] font-bold border-none",
                          selectedTicket?.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {selectedTicket?.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Ticket Info */}
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ticket Details</p>
                          <div className="bg-muted/20 p-4 rounded-xl border border-border space-y-3">
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-0.5">Subject</p>
                              <p className="text-sm font-semibold">{selectedTicket?.subject}</p>
                            </div>
                            <div className="flex gap-3">
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-0.5">Category</p>
                                <Badge variant="outline" className="text-[10px] rounded-md">{selectedTicket?.category}</Badge>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground mb-0.5">Priority</p>
                                <Badge className={cn(
                                  "text-[10px] rounded-md border-none",
                                  selectedTicket?.priority === "URGENT" ? "bg-red-100 text-red-600" :
                                  selectedTicket?.priority === "HIGH" ? "bg-orange-100 text-orange-600" :
                                  "bg-blue-100 text-blue-600"
                                )}>{selectedTicket?.priority}</Badge>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-0.5">Description</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{selectedTicket?.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User Profile</p>
                          <div className="bg-muted/20 p-4 rounded-xl border border-border space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-border">
                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                                  {userData?.ownerName?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{userData?.ownerName || "—"}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{userData?.email || "—"}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <p className="text-[10px] text-muted-foreground">Business</p>
                                <p className="text-xs font-semibold truncate">{userData?.businessName || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground">Phone</p>
                                <p className="text-xs font-semibold">{userData?.phone || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground">Plan</p>
                                <p className="text-xs font-semibold text-primary">{userData?.subscriptionPlan || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground">Status</p>
                                <p className="text-xs font-semibold text-green-600">{userData?.subscriptionStatus || "—"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ─── Messages ─── */}
            <ScrollArea className="flex-1 bg-muted/5">
              <div className="p-5 space-y-4 max-w-3xl mx-auto">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                      <HelpCircle className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground/40">No messages yet</p>
                    <p className="text-[10px] text-muted-foreground/30 mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg: any, idx: number) => {
                    const isFromAdmin = msg.senderType === "ADMIN";
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex gap-2.5",
                          isFromAdmin ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <Avatar className="w-7 h-7 shrink-0 mt-1 border border-border">
                          <AvatarFallback className={cn(
                            "text-[10px] font-bold",
                            isFromAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            {isFromAdmin ? "A" : (userData?.ownerName?.charAt(0) || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-[70%] space-y-0.5", isFromAdmin ? "items-end" : "items-start")}>
                          <div 
                            className={cn(
                              "px-3.5 py-2.5 text-[13px] leading-relaxed",
                              isFromAdmin 
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                                : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm"
                            )}
                          >
                            {msg.message}
                          </div>
                          <p className={cn(
                            "text-[10px] text-muted-foreground/40 px-1",
                            isFromAdmin ? "text-right" : "text-left"
                          )}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* ─── Message Input Bar ─── */}
            <div className="border-t border-border bg-card px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Input
                  placeholder="Type your reply..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(messageText);
                    }
                  }}
                  className="h-10 flex-1 rounded-lg border-border bg-muted/30 text-sm px-4 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
                <Button 
                  onClick={() => handleSendMessage(messageText)}
                  disabled={!messageText.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-lg shrink-0 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT: Operations Sidebar ═══════ */}
          <div className="w-[360px] border-l border-border bg-card hidden xl:flex flex-col shrink-0">
            
            {/* Quick User Card */}
            <div className="p-5 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Requester</p>
              {isUserLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ) : userData ? (
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-border">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {userData.ownerName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{userData.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{userData.email}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <Badge variant="secondary" className="rounded-md text-[8px] font-bold bg-primary/5 text-primary border-none h-4 px-1.5">
                      {userData.subscriptionPlan || "FREE"}
                    </Badge>
                    <Badge variant="secondary" className="rounded-md text-[8px] font-bold bg-green-50 text-green-600 border-none h-4 px-1.5">
                      {userData.subscriptionStatus || "ACTIVE"}
                    </Badge>
                  </div>
                </div>
              ) : isTicketLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40 italic">No user data linked</p>
              )}

              {/* Ticket quick-info */}
              {selectedTicket && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Ticket</p>
                    <div className="flex gap-1.5">
                      <Badge className={cn(
                        "h-4 rounded text-[8px] font-bold border-none px-1.5",
                        selectedTicket.priority === "URGENT" ? "bg-red-100 text-red-600" :
                        selectedTicket.priority === "HIGH" ? "bg-orange-100 text-orange-600" :
                        "bg-blue-100 text-blue-600"
                      )}>{selectedTicket.priority}</Badge>
                      <Badge className="h-4 rounded text-[8px] font-bold bg-muted text-muted-foreground border-none px-1.5">
                        {selectedTicket.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-snug">{selectedTicket.subject}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{selectedTicket.description}</p>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div className="p-5 border-b border-border flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Internal Notes</p>
              </div>
              
              <div className="mb-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    className="h-8 text-xs rounded-lg bg-muted/20 border-border/50"
                  />
                  <Button 
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    size="sm" 
                    className="h-8 px-3 rounded-lg text-[10px] font-bold shrink-0"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {isNotesLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/30" />
                    </div>
                  ) : internalNotes.length === 0 ? (
                    <p className="text-[11px] text-center text-muted-foreground/40 py-6">No notes yet</p>
                  ) : (
                    internalNotes.map((note) => (
                      <div key={note.id} className="p-2.5 bg-muted/30 rounded-lg border border-border/30 hover:border-border transition-colors">
                        <p className="text-[11px] text-foreground/80 leading-relaxed">{note.noteContent}</p>
                        <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-border/20">
                          <span className="text-[9px] font-semibold text-primary/50">{note.agentName || "Admin"}</span>
                          <span className="text-[9px] text-muted-foreground/40">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Quick Actions */}
            <div className="p-5 space-y-2 shrink-0">
              <Button 
                onClick={() => handleUpdateStatus("CLOSED")}
                disabled={isStatusUpdating || conversations.find(c => c.id === activeConversationId)?.status === 'CLOSED'}
                variant="destructive" 
                className="w-full rounded-lg font-bold text-[11px] h-9"
              >
                {isStatusUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                Resolve & Close
              </Button>
              <Button 
                onClick={() => handleUpdateStatus("OPEN")}
                variant="ghost" 
                className="w-full rounded-lg text-[11px] font-medium h-8 text-muted-foreground"
              >
                Reopen Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
