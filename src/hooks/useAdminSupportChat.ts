import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, Conversation, ChatServerMessage, ChatWebSocketMessage } from "@/types/chat";
import { CHAT_WS_URL } from "@/constants/api";

interface UseAdminSupportChatProps {
  adminId: string;
  token: string;
}

function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const useAdminSupportChat = ({ adminId: initialAdminId, token }: UseAdminSupportChatProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract real adminId from JWT if possible
  const decoded = decodeJWT(token);
  const adminId = decoded?.sub || decoded?.userId || initialAdminId;
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeIdRef = useRef<string | null>(null);

  // Sync ref with state to avoid closure staleness in onmessage without reconnecting
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const connect = useCallback(() => {
    if (!CHAT_WS_URL) {
      console.error("CHAT_WS_URL is not defined in environment variables");
      setError("WebSocket configuration missing");
      setLoading(false);
      return;
    }

    if (!initialAdminId && !decoded) {
        console.warn("[Chat] No admin identity found. WebSocket might be rejected.");
    }

    // Clean URL to handle trailing slashes which common AWS setups dislike before the query
    const baseUrl = CHAT_WS_URL.endsWith('/') ? CHAT_WS_URL.slice(0, -1) : CHAT_WS_URL;
    
    // Spec Step 1: userId = adminId, token = adminToken as protocol header
    const url = `${baseUrl}?userId=${adminId}`;
    console.log("[Chat] Attempting connection:", url, "Identity:", adminId);
    
    if (!token) {
        console.error("[Chat] No JWT token found in cookies. Handshake will likely fail.");
        setError("Unauthorized - Missing Token");
        setLoading(false);
        return;
    }

    const ws = new WebSocket(url, [token]);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[Chat] WebSocket Connected");
      setLoading(false);
      setError(null);
      
      // Spec Step 2: Send getConversations on open
      ws.send(JSON.stringify({ action: "getConversations" }));
      
      // Also request offline notifications as per spec "Offline" section
      ws.send(JSON.stringify({ action: "getNotifications" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[Chat] Received:", data.type, data);
        
        switch (data.type) {
          case "CONVERSATIONS_LIST":
            if (data.data) {
              const standardized = data.data.map((c: any) => ({
                ...c,
                id: c.id || c.conversationId
              }));
              setConversations(standardized);
            } else if (data.conversations) {
              const standardized = data.conversations.map((c: any) => ({
                ...c,
                id: c.id || c.conversationId
              }));
              setConversations(standardized);
            }
            break;

          case "HISTORY":
            // Spec Step 4: Receive HISTORY with messages[]
            if (data.messages) {
              const getTs = (ts?: any): number => {
                if (!ts) return 0;
                const num = Number(ts);
                if (!isNaN(num)) return num; // It's numeric epoch
                const parsed = Date.parse(ts);
                return isNaN(parsed) ? 0 : parsed; // It's a string date
              };
              
              const items = [...data.messages].sort((a, b) => getTs(a.timestamp) - getTs(b.timestamp));
              
              console.log("[Chat] History sorted (Oldest first):", 
                items.length > 0 ? getTs(items[0].timestamp) : "none",
                "to",
                items.length > 0 ? getTs(items[items.length-1].timestamp) : "none"
              );
              setMessages(items);
            }
            break;

          case "NEW_MESSAGE":
            // Spec Step 6: Live message received
            const newMessage = data; // data contains conversationId, senderType, etc.
            console.log("[Chat] New message received:", newMessage);
            
            // Check if it belongs to active thread
            if (newMessage.conversationId === activeIdRef.current) {
              setMessages((prev) => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                console.log("[Chat] Adding new message to active conversation");
                return [...prev, newMessage];
              });
            } else {
              // Increment unread badge for that conversation
              setConversations((prev) => 
                prev.map((c) => 
                  (c.id === newMessage.conversationId || (c as any).conversationId === newMessage.conversationId)
                    ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: newMessage.message } 
                    : c
                )
              );
            }
            break;

          case "NOTIFICATIONS":
            console.log("[Chat] Offline Notifications:", data.data);
            // Could merge these into conversation unreads if needed
            break;

          case "ERROR":
            // Spec Step Table: message, code
            const errorMsg = data.message || data.error || "Communication Error";
            setError(errorMsg);
            console.error("[Chat] Server Error:", errorMsg, data.code);
            break;

          default:
            console.warn("[Chat] Unknown message type:", data.type);
        }
      } catch (e) {
        console.error("[Chat] Failed to parse message:", e, "Raw data:", event.data);
      }
    };

    ws.onclose = (event) => {
      console.log("[Chat] WebSocket Disconnected. Code:", event.code, "Reason:", event.reason);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      
      // Don't auto-reconnect if it was a clean close or unauthorized (403/401 logic if needed)
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("[Chat] WebSocket Transport Error:", err);
      if (conversations.length === 0) {
        setError("WebSocket Connection Error - Check console for details");
      }
      setLoading(false);
    };
  }, [adminId, token, conversations.length]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const selectConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId);
    
    if (!conversationId) return;

    // Reset unread count locally
    setConversations((prev) => 
      prev.map((c) => (c.id === conversationId || (c as any).conversationId === conversationId) ? { ...c, unreadCount: 0 } : c)
    );

    // Spec Step 4: Admin Clicks a Conversation → Load History
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        action: "getHistory", 
        conversationId 
      }));
    }
  }, []);

  const sendMessage = useCallback((messageText: string) => {
    if (!messageText.trim() || !activeConversationId) {
      console.log("Cannot send message - missing text or conversation");
      return;
    }

    console.log("WebSocket readyState:", socketRef.current?.readyState);
    console.log("WebSocket.OPEN:", WebSocket.OPEN);

    // Spec Step 5: Admin Sends Reply
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageData = {
        action: "sendMessage",
        conversationId: activeConversationId,
        message: messageText
      };
      console.log("Sending WebSocket message:", messageData);
      socketRef.current.send(JSON.stringify(messageData));
    } else {
        console.error("WebSocket not open, cannot send message");
        setError("Connection lost. Reconnecting...");
    }
  }, [activeConversationId]);

  return {
    conversations,
    activeConversationId,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage
  };
};
