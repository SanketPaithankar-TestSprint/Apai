export interface Feedback {
  feedbackId: number;
  userId: number;
  name: string;
  email: string;
  category?: 
    | "BUG" 
    | "FEATURE_REQUEST" 
    | "UI_UX" 
    | "PERFORMANCE" 
    | "ESTIMATE_ACCURACY" 
    | "INTEGRATION_ISSUE" 
    | "SUPPORT" 
    | "GENERAL" 
    | "WORKFLOW_ISSUE";
  rating: number;
  message: string;
  pageUrl: string;
  source: string;
  device: string;
  browser: string;
  clientTimestamp: string;
  createdAt: string;
}

export interface FeedbackSubmission {
  userId?: number;
  name?: string;
  email?: string;
  category?: string;
  rating: number;
  message: string;
  pageUrl: string;
  source: string;
  device: string;
  browser: string;
  clientTimestamp: string;
}
