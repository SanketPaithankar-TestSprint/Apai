import { API_ENDPOINTS } from "@/constants/api"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import type { AdminSmsCredits, GrantSmsCreditsRequest } from "@/types/sms-credits"

export class SmsCreditsApiError extends Error {
  status: number
  /** Field-level messages from a 400 response, keyed by request field name */
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = "SmsCreditsApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function toApiError(res: Response, fallback: string): Promise<SmsCreditsApiError> {
  let message = fallback
  const fieldErrors: Record<string, string> = {}
  try {
    const body = await res.json()
    if (typeof body?.message === "string" && body.message) message = body.message
    else if (typeof body?.error === "string" && body.error) message = body.error

    // Accept either { errors: { field: msg } } or { errors: [{ field, message }] }
    const errors = body?.errors ?? body?.fieldErrors ?? body?.data
    if (Array.isArray(errors)) {
      for (const e of errors) {
        if (e && typeof e.field === "string") fieldErrors[e.field] = String(e.message ?? e.defaultMessage ?? message)
      }
    } else if (errors && typeof errors === "object") {
      for (const [k, v] of Object.entries(errors)) {
        if (typeof v === "string") fieldErrors[k] = v
      }
    }
  } catch {
    // Non-JSON body; keep fallback message
  }
  return new SmsCreditsApiError(res.status, message, fieldErrors)
}

export const smsCreditsService = {
  getUserSmsCredits: async (userId: number): Promise<AdminSmsCredits> => {
    const res = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_SMS_CREDITS(userId))
    if (!res.ok) throw await toApiError(res, "Failed to load SMS credits")
    return res.json()
  },

  grantUserSmsCredits: async (userId: number, body: GrantSmsCreditsRequest): Promise<AdminSmsCredits> => {
    const res = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_SMS_CREDITS(userId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await toApiError(res, "Failed to grant SMS credits")
    return res.json()
  },
}
