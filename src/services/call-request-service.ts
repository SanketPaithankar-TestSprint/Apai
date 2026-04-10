import { API_ENDPOINTS } from "@/constants/api"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { 
  CallRequest, 
  CallRequestParams, 
  UpdateCallRequestStatus, 
  AddCallRequestNotes 
} from "@/types/call-request"

export const callRequestService = {
  getCallRequests: async (params: CallRequestParams = {}): Promise<CallRequest[]> => {
    const queryParams = new URLSearchParams()
    if (params.date) queryParams.append("date", params.date)
    if (params.status && params.status !== "ALL") queryParams.append("status", params.status)

    const response = await fetchWithAuth(`${API_ENDPOINTS.ADMIN_CALL_REQUESTS}?${queryParams.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch call requests")
    return response.json()
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CALL_REQUEST_STATUS(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error("Failed to update call request status")
  },

  addNotes: async (id: string, adminNotes: string): Promise<void> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CALL_REQUEST_NOTES(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes }),
    })
    if (!response.ok) throw new Error("Failed to add call request notes")
  },
}
