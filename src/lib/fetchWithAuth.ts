export function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getCookie("token");
  
  const headers = {
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  } as HeadersInit;

  return fetch(url, { ...options, headers });
}
