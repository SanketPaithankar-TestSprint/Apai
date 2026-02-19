export const API_BASE_URL = process.env.NEXT_PUBLIC_JAVA_BACKEND_URL;
export const API_ENDPOINTS = {
  ANALYTICS: `${API_BASE_URL}analytics`,
  USERS: `${API_BASE_URL}users`,
  BLOGS: `${API_BASE_URL}blogs`,
  LOGIN: `${API_BASE_URL}admin/auth/login`,
};