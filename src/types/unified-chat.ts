import { Conversation } from "./chat";

export interface UnifiedConversation extends Conversation {
  type: 'ticket' | 'chat';
}
