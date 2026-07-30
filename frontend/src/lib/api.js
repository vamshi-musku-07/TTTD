const API_URL = import.meta.env.VITE_API_URL || '/api';

const AUTH_SKIP_RETRY_PATHS = ['/auth/login', '/auth/google', '/auth/refresh'];

/** Only these endpoints need the httpOnly refresh cookie. */
const COOKIE_AUTH_PATHS = ['/auth/login', '/auth/google', '/auth/refresh', '/auth/logout'];

function needsAuthCookies(path) {
  return COOKIE_AUTH_PATHS.some((authPath) => path.startsWith(authPath));
}

/**
 * Brave Shields often blocks cross-site credentialed fetches.
 * Use cookies only where required; Bearer-token calls stay same-origin / omit cookies.
 */
function getCredentialsMode(path) {
  if (!needsAuthCookies(path)) return 'same-origin';
  return 'include';
}

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'SessionExpiredError';
  }
}

export function isSessionExpiredError(err) {
  return err instanceof SessionExpiredError;
}

let authHandlers = {
  getToken: () => null,
  onTokenRefreshed: null,
  onSessionExpired: null,
};

let refreshPromise = null;

export function configureApiAuth(handlers) {
  authHandlers = { ...authHandlers, ...handlers };
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: getCredentialsMode('/auth/refresh'),
        headers: { 'Content-Type': 'application/json' },
      });

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Refresh failed');
      }

      authHandlers.onTokenRefreshed?.(data);
      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(path, options = {}) {
  const { token, activeRole, _retried, ...fetchOptions } = options;

  const authToken = token ?? authHandlers.getToken?.() ?? null;
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  const headers = {
    ...fetchOptions.headers,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (activeRole) {
    headers['X-Active-Role'] = activeRole;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: getCredentialsMode(path),
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  }

  const skipAuthRetry = AUTH_SKIP_RETRY_PATHS.some((authPath) => path.startsWith(authPath));

  if (response.status === 401 && authToken && !skipAuthRetry && !_retried) {
    try {
      const newToken = await refreshAccessToken();
      return request(path, { ...options, token: newToken, _retried: true });
    } catch {
      authHandlers.onSessionExpired?.();
      throw new SessionExpiredError();
    }
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
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  googleAuth: (body) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify(body) }),

  refresh: () => request('/auth/refresh', { method: 'POST' }),

  logout: (token) =>
    request('/auth/logout', { method: 'POST', token }),

  me: (token) => request('/auth/me', { token }),

  updateProfile: (body, token) =>
    request('/auth/me', { method: 'PATCH', body: JSON.stringify(body), token }),

  uploadAvatar: (file, token) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request('/uploads/avatar', { method: 'POST', body: formData, token });
  },

  verifyEmail: (token) =>
    request(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email) =>
    request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getEvents: (token) => request('/events', { token }),

  getEvent: (eventId, token) => request(`/events/${eventId}`, { token }),

  createEvent: (body, token) =>
    request('/events', { method: 'POST', body: JSON.stringify(body), token }),

  updateEvent: (eventId, body, token) =>
    request(`/events/${eventId}`, { method: 'PATCH', body: JSON.stringify(body), token }),

  deleteEvent: (eventId, token) =>
    request(`/events/${eventId}`, { method: 'DELETE', token }),

  updateEventStatus: (eventId, body, token) =>
    request(`/events/${eventId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),

  getEventVideos: (eventId, token) =>
    request(`/events/${eventId}/videos`, { token }),

  createVideo: (eventId, body, token) =>
    request(`/events/${eventId}/videos`, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),

  updateVideo: (videoId, body, token) =>
    request(`/videos/${videoId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),

  deleteVideo: (videoId, token) =>
    request(`/videos/${videoId}`, { method: 'DELETE', token }),

  getEditorDashboard: (token, { editorId } = {}) => {
    const query = editorId ? `?editorId=${encodeURIComponent(editorId)}` : '';
    return request(`/dashboard/editor${query}`, { token });
  },

  getAdminDashboard: (token, activeRole) =>
    request('/dashboard/admin', { token, activeRole }),

  getTeamMembers: (token) => request('/team', { token }),

  createTeamMember: (body, token) =>
    request('/team', { method: 'POST', body: JSON.stringify(body), token }),

  updateTeamMember: (userId, body, token) =>
    request(`/team/${userId}`, { method: 'PATCH', body: JSON.stringify(body), token }),

  deleteTeamMember: (userId, token) =>
    request(`/team/${userId}`, { method: 'DELETE', token }),

  getComplaintRecipients: (token) =>
    request('/complaints/recipients', { token }),

  getComplaints: (token, activeRole) =>
    request('/complaints', { token, activeRole }),

  createComplaint: (body, token) =>
    request('/complaints', { method: 'POST', body: JSON.stringify(body), token }),

  resolveComplaint: (complaintId, body, token, activeRole) =>
    request(`/complaints/${complaintId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
      activeRole,
    }),

  getNotifications: (token) => request('/notifications', { token }),

  markNotificationRead: (notificationId, token) =>
    request(`/notifications/${notificationId}/read`, { method: 'PATCH', token }),

  markAllNotificationsRead: (token) =>
    request('/notifications/read-all', { method: 'PATCH', token }),
};

export { ApiError };
