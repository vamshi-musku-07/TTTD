const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, options = {}) {
  const { token, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || 'Something went wrong',
      response.status,
      data?.errors
    );
  }

  return data;
}

export const api = {
  signup: (body) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  googleAuth: (body) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify(body) }),

  refresh: () => request('/auth/refresh', { method: 'POST' }),

  logout: (token) =>
    request('/auth/logout', { method: 'POST', token }),

  me: (token) => request('/auth/me', { token }),

  verifyEmail: (token) =>
    request(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email) =>
    request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

export { ApiError };
