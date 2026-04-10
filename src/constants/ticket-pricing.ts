import { TicketCategory } from "@/types/ticket"

export const TICKET_PRICES: Record<TicketCategory, number> = {
  BILLING: 0,
  TECHNICAL: 25.0,
  ACCOUNT: 0,
  FEATURE_REQUEST: 49.99,
  GENERAL: 9.99,
}

export const getTicketPrice = (category: TicketCategory): number => {
  return TICKET_PRICES[category] || 0;
}
