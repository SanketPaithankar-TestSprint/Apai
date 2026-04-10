import { API_ENDPOINTS } from "@/constants/api"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { Feedback, FeedbackSubmission } from "@/types/feedback"

export const feedbackService = {
  getFeedbacks: async (): Promise<Feedback[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_FEEDBACK)
    if (!response.ok) {
      throw new Error("Failed to fetch feedbacks")
    }
    return response.json()
  },

  submitFeedback: async (feedback: FeedbackSubmission): Promise<Feedback> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_FEEDBACK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    })
    if (!response.ok) {
      throw new Error("Failed to submit feedback")
    }
    return response.json()
  },
}
