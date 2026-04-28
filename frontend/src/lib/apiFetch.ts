import API_BASE_URL, { API_ENDPOINTS } from '@/config/api';

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const { getAccessToken, setAccessToken, clearAccessToken } = await import('./authToken');

  // Build request
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');

  const res = await fetch(typeof input === 'string' && input.startsWith('http') ? input : `${API_BASE_URL}${String(input)}`, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    // Try silent refresh once
    try {
      const refreshRes = await fetch(API_ENDPOINTS.AUTH.REFRESH, { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          headers.set('Authorization', `Bearer ${data.accessToken}`);
          return fetch(typeof input === 'string' && input.startsWith('http') ? input : `${API_BASE_URL}${String(input)}`, {
            ...init,
            headers,
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return res;
}

export default apiFetch;
