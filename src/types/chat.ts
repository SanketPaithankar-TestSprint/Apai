export type ChatMessageType = "ADMIN" | "SHOP" | "VISITOR";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: ChatMessageType;
  message: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  visitorId: string;
  visitorName: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
  status: "OPEN" | "CLOSED";
}

export interface ChatWebSocketMessage {
  action: "getConversations" | "getHistory" | "sendMessage";
  conversationId?: string;
  message?: string;
  adminId?: string;
}

export interface ChatServerMessage {
  type: "CONVERSATIONS_LIST" | "HISTORY" | "NEW_MESSAGE" | "ERROR";
  conversations?: Conversation[];
  messages?: ChatMessage[];
  message?: ChatMessage;
  error?: string;
}
