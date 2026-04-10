export const API_BASE_URL = import.meta.env.VITE_JAVA_BACKEND_URL as string | undefined;
export const CDN_BASE_URL = import.meta.env.VITE_CDN_BASE_URL as string | undefined;
export const CHAT_WS_URL = "wss://y3rxp208gj.execute-api.us-east-1.amazonaws.com/prod/";
export const API_ENDPOINTS = {
  ANALYTICS: `${API_BASE_URL}admin/analytics`,
  ANALYTICS_TICKETS: `${API_BASE_URL}admin/analytics/tickets`,
  ANALYTICS_CALLS: `${API_BASE_URL}admin/analytics/calls`,
  ANALYTICS_ARTICLES: `${API_BASE_URL}admin/analytics/articles`,
  USERS: `${API_BASE_URL}users`,
  BLOGS: `${API_BASE_URL}v1/blogs`,
  BLOG_UPLOAD_IMAGE: `${API_BASE_URL}v1/blogs/upload-image`,
  LOGIN: `${API_BASE_URL}admin/auth/login`,
  ADMIN_REGISTER: `${API_BASE_URL}admin/auth/register`,
  ADMIN_USERS: `${API_BASE_URL}admin/users`,
  ADMIN_USER_STATUS: (userId: number) => `${API_BASE_URL}admin/users/${userId}/status`,
  ADMIN_USER_SUBSCRIPTION: (userId: number) => `${API_BASE_URL}admin/users/${userId}/subscription`,
  ADMIN_USER_DELETE: (userId: number) => `${API_BASE_URL}admin/users/${userId}`,
  ADMIN_USER_BUSINESS_LICENSE: (userId: number) => `${API_BASE_URL}admin/users/${userId}/business-license`,
  ADMIN_CREATE_TEST_ACCOUNT: `${API_BASE_URL}admin/users/test-account`,
  
  // Support Tickets
  ADMIN_TICKETS: `${API_BASE_URL}admin/tickets`,
  ADMIN_TICKET: (id: string) => `${API_BASE_URL}admin/tickets/${id}`,
  ADMIN_TICKET_STATUS: (id: string) => `${API_BASE_URL}admin/tickets/${id}/status`,
  ADMIN_TICKET_ASSIGN: (id: string) => `${API_BASE_URL}admin/tickets/${id}/assign`,
  ADMIN_TICKET_MESSAGES: (id: string) => `${API_BASE_URL}admin/tickets/${id}/messages`,
  ADMIN_TICKET_INTERNAL_NOTE: (id: string) => `${API_BASE_URL}admin/tickets/${id}/internal-note`,
  ADMIN_TICKET_INTERNAL_NOTES: (id: string) => `${API_BASE_URL}admin/tickets/${id}/internal-notes`,

  // Help Articles (Knowledge Base)
  ADMIN_ARTICLES: `${API_BASE_URL}admin/articles`,
  SUPPORT_ARTICLE: (id: string) => `${API_BASE_URL}support/articles/${id}`,
  ADMIN_ARTICLE: (id: string) => `${API_BASE_URL}admin/articles/${id}`,
  ADMIN_CATEGORIES: `${API_BASE_URL}admin/categories`,
  ADMIN_CATEGORY: (id: number) => `${API_BASE_URL}admin/categories/${id}`,

  // Call Requests
  ADMIN_CALL_REQUESTS: `${API_BASE_URL}admin/call-requests`,
  ADMIN_CALL_REQUEST_STATUS: (id: string) => `${API_BASE_URL}admin/call-requests/${id}/status`,
  ADMIN_CALL_REQUEST_NOTES: (id: string) => `${API_BASE_URL}admin/call-requests/${id}/notes`,
  ADMIN_FEEDBACK: `${API_BASE_URL}feedback`,
};