import React, { useState, useEffect, useRef } from "react";
import { useAdminSupportChat } from "@/hooks/useAdminSupportChat";
import { 
  Send, 
  User, 
  MessageCircle, 
  Search, 
  Loader2, 
  Store,
  Clock,
  Circle,
  ArrowLeft,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminSupportDashboardProps {
  adminId: string;
  token: string;
}

export const AdminSupportDashboard: React.FC<AdminSupportDashboardProps> = ({ adminId, token }) => {
  const {
    conversations,
    activeConversationId,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage
  } = useAdminSupportChat({ adminId, token });

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const activeConversation = conversations.find((c) => 
    c.id === activeConversationId || (c as any).conversationId === activeConversationId
  );
  const filteredConversations = conversations.filter((c) => 
    c.visitorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!messageText.trim()) return;
    console.log("Sending message:", messageText);
    console.log("Active conversation:", activeConversationId);
    sendMessage(messageText);
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="h-[600px] w-full">
        <CardContent className="flex h-full flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
             <Circle className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">Connection Failed</h3>
            <p className="text-muted-foreground max-w-xs">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reconnect WebSocket
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleBack = () => {
    selectConversation(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      {!activeConversationId ? (
        /* LIST VIEW */
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Support Console</CardTitle>
                <p className="text-muted-foreground">Select an active shop session to start helping</p>
              </div>
            </div>
            
            <div className="relative mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by shop name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredConversations.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">No active sessions matching your search</p>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const cId = c.id || (c as any).conversationId;
                    return (
                      <Card
                        key={cId}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
                        onClick={() => selectConversation(cId)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {c.visitorName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground truncate">
                                  {c.visitorName || "Unnamed Shop"}
                                </h4>
                                {c.unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2">
                                    {c.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {c.lastMessage || "Identity verified. Waiting for input..."}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        /* CHAT VIEW (True Full Screen) */
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Header */}
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBack}
                  className="h-10 w-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{activeConversation?.visitorName}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">Active Live Session</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right hidden md:block">
                <span className="text-xs text-muted-foreground">Session ID: {activeConversationId?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Syncing message history...</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isLastMessage = i === messages.length - 1;
                    const isAdmin = m.senderType === "ADMIN";

                    return (
                      <div
                        key={m.id}
                        className={cn("flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2", isAdmin ? "items-end ml-auto" : "items-start")}
                        ref={isLastMessage ? scrollRef : null}
                      >
                        <div className={cn(
                          "rounded-2xl px-4 py-3 text-sm",
                          isAdmin 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-foreground"
                        )}>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Box */}
          <div className="border-t bg-card px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <textarea 
                  placeholder={`Write a response for ${activeConversation?.visitorName}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="h-[44px] px-6 self-end"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure delivery channel active
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
