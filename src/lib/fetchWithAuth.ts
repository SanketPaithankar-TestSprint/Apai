export function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getCookie("token");
  
  // Cache busting: append a timestamp to GET requests to force the browser to skip its cache.
  // We only do this for GET requests to not break POST/PUT/DELETE flows.
  let targetUrl = url;
  if (!options.method || options.method === "GET") {
    const separator = url.includes("?") ? "&" : "?";
    targetUrl = `${url}${separator}t=${Date.now()}`;
  }

  const headers = {
    ...options.headers,
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  } as HeadersInit;

  return fetch(targetUrl, { ...options, headers });
}
