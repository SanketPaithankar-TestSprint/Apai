export interface AdminSmsCredits {
  userId: number
  /** Available balance */
  smsCredits: number
  totalToppedUp: number
  /** Positive magnitude */
  totalDebited: number
  /** Positive magnitude */
  totalRefunded: number
  /** ISO timestamp the numbers were read at */
  asOf: string
}

export interface GrantSmsCreditsRequest {
  credits: number
  reason?: string
}
