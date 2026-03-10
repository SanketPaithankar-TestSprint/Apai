export const API_BASE_URL = process.env.NEXT_PUBLIC_JAVA_BACKEND_URL;
export const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL;
export const API_ENDPOINTS = {
  ANALYTICS: `${API_BASE_URL}analytics`,
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
};