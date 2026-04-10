import { API_ENDPOINTS } from "@/constants/api"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { 
  Ticket, 
  TicketsResponse, 
  TicketMessage, 
  InternalNote,
  GetTicketsParams
} from "@/types/ticket"

export const ticketService = {
  getTickets: async (params: GetTicketsParams = {}): Promise<TicketsResponse> => {
    const queryParams = new URLSearchParams()
    if (params.status && params.status !== "ALL") queryParams.append("status", params.status)
    if (params.priority && params.priority !== "ALL") queryParams.append("priority", params.priority)
    if (params.agentId) queryParams.append("agentId", params.agentId.toString())
    if (params.search) queryParams.append("search", params.search)
    queryParams.append("page", (params.page || 0).toString())
    queryParams.append("limit", (params.limit || 10).toString())

    const response = await fetchWithAuth(`${API_ENDPOINTS.ADMIN_TICKETS}?${queryParams.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch tickets")
    return response.json()
  },

  getTicket: async (id: string): Promise<Ticket> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_TICKET(id))
    if (!response.ok) throw new Error("Failed to fetch ticket details")
    return response.json()
  },

  updateStatus: async (id: string, status: string) => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_TICKET_STATUS(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error("Failed to update ticket status")
    return response.json()
  },

  assignTicket: async (id: string, agentId: number) => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_TICKET_ASSIGN(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    })
    if (!response.ok) throw new Error("Failed to assign ticket")
    return response.json()
  },

  getMessages: async (id: string): Promise<TicketMessage[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_TICKET_MESSAGES(id))
    if (!response.ok) throw new Error("Failed to fetch ticket messages")
    return response.json()
  },

  sendMessage: async (id: string, message: string, attachments: string[] = []): Promise<TicketMessage> => {
    const queryParams = new URLSearchParams()
    queryParams.append("message", message)
    
    const response = await fetchWithAuth(`${API_ENDPOINTS.ADMIN_TICKET_MESSAGES(id)}?${queryParams.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachments }),
    })
    if (!response.ok) throw new Error("Failed to send message")
    return response.json()
  },

  addInternalNote: async (id: string, noteContent: string): Promise<InternalNote> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_TICKET_INTERNAL_NOTE(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteContent }),
    })
    if (!response.ok) throw new Error("Failed to add internal note")
    return response.json()
  },

  getInternalNotes: async (id: string): Promise<InternalNote[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_TICKET_INTERNAL_NOTES(id))
    if (!response.ok) throw new Error("Failed to fetch internal notes")
    return response.json()
  },
}
