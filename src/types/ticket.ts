export type TicketCategory = "BILLING" | "TECHNICAL" | "ACCOUNT" | "FEATURE_REQUEST" | "GENERAL"

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export interface TicketAttachment {
  attachmentId: number
  customerId: number
  userId: number
  documentId: number
  description: string | null
  originalFileName: string
  fileExtension: string
  contentType: string
  s3Url: string
  uploadedAt: string
}

export interface Ticket {
  id: string
  userId: number
  subject: string
  category: TicketCategory
  priority: TicketPriority
  description: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
  attachments: TicketAttachment[]
  price?: number // Optional price field as requested
}

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: number
  senderName: string
  message: string
  attachments: string[]
  createdAt: string
  admin: boolean
}

export interface InternalNote {
  id: string
  ticketId: string
  agentId: number
  agentName: string
  noteContent: string
  createdAt: string
}

export interface TicketsResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  number: number
  size: number
  numberOfElements: number
  empty: boolean
  content: Ticket[]
}

export interface GetTicketsParams {
  status?: string
  priority?: string
  agentId?: number
  search?: string
  page?: number
  limit?: number
}
