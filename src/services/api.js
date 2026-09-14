const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const isApiConfigured = Boolean(API_BASE_URL);

const errorMessageForStatus = (status) => {
  if (status === 401) return 'Your session has expired. Please login again.';
  if (status === 403) return 'You do not have permission to access attendance.';
  if (status === 404) return 'The requested attendance service was not found.';
  if (status >= 500) return 'Something went wrong. Please try again later.';
  return 'The request could not be completed. Please try again.';
};

export async function apiRequest(path, { method = 'GET', token, query, body, signal, headers: extraHeaders } = {}) {
  if (!API_BASE_URL) {
    return null;
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(extraHeaders || {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new ApiError('Unable to connect to the server. Please check your internet connection.', 0, error);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    throw new ApiError(payload?.message || errorMessageForStatus(response.status), response.status, payload);
  }

  return payload;
}
