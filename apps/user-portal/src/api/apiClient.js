const BASE_URL = 'http://localhost:5000/api';

export async function apiClient(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Credentials include allows browser to send and receive HttpOnly cookies
  options.credentials = 'include';
  options.headers = {
    'Accept': 'application/json',
    ...options.headers
  };

  // If body is object and not FormData, convert to JSON string
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, options);
    
    // Parse json response safely
    let payload;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = { success: response.ok, message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'API operation failed.');
      error.status = response.status;
      error.code = payload.error?.code || 'HTTP_ERROR';
      error.details = payload.error?.details || null;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.status !== 401) {
      console.error(`❌ apiClient error on ${endpoint}:`, error.message);
    }
    throw error;
  }
}

export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c';
  if (url.startsWith('/')) {
    return `http://localhost:5000${url}`;
  }
  return url;
};
