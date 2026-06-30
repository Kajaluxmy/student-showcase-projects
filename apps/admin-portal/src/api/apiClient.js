const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  options.credentials = 'include';
  options.headers = {
    'Accept': 'application/json',
    ...options.headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, options);
    let payload;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = { success: response.ok, message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'Admin API operation failed.');
      error.status = response.status;
      error.code = payload.error?.code || 'HTTP_ERROR';
      error.details = payload.error?.details || null;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.status !== 401) {
      console.error(`❌ Admin apiClient error on ${endpoint}:`, error.message);
    }
    throw error;
  }
}

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c';
  if (url.startsWith('/')) {
    const apiHost = import.meta.env.VITE_API_HOST || 'http://localhost:5000';
    return `${apiHost}${url}`;
  }
  return url;
};
