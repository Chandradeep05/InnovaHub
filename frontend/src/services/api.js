/**
 * Centralized API Service Layer
 * 
 * All API calls go through this module instead of raw fetch().
 * Base URL is read from environment variable, making deployment seamless.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Core request function with auth header injection and error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Auto-attach admin token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 — auto-redirect to login
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Only redirect if on an admin page
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }

  return response;
}

// ── Public API ───────────────────────────────────

export const api = {
  // Health
  health: () => request('/api/health'),

  // Events
  getEvents: () => request('/api/events'),
  registerForEvent: (data) => request('/api/registrations', { method: 'POST', body: JSON.stringify(data) }),

  // Innovation Ideas
  getIdeas: () => request('/api/ideas'),
  submitIdea: (data) => request('/api/ideas', { method: 'POST', body: JSON.stringify(data) }),

  // Contact Queries
  submitQuery: (data) => request('/api/queries', { method: 'POST', body: JSON.stringify(data) }),

  // Gallery
  getPhotos: () => request('/api/photos'),

  // Reports
  getReports: () => request('/api/reports'),

  // Members
  getMembers: () => request('/api/members'),
};

// ── Admin API ────────────────────────────────────

export const adminApi = {
  // Auth
  login: (email, password) => request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  // Events
  createEvent: (data) => request('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: 'DELETE' }),

  // Queries
  getQueries: () => request('/api/admin/queries'),
  deleteQuery: (id) => request(`/api/queries/${id}`, { method: 'DELETE' }),

  // Ideas
  getIdeas: () => request('/api/admin/ideas'),
  updateIdeaStatus: (id, status) => request(`/api/ideas/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteIdea: (id) => request(`/api/ideas/${id}`, { method: 'DELETE' }),

  // Gallery
  uploadPhoto: (data) => request('/api/admin/photos', { method: 'POST', body: JSON.stringify(data) }),
  deletePhoto: (id) => request(`/api/photos/${id}`, { method: 'DELETE' }),

  // Reports
  uploadReport: (data) => request('/api/admin/reports', { method: 'POST', body: JSON.stringify(data) }),
  deleteReport: (id) => request(`/api/reports/${id}`, { method: 'DELETE' }),

  // Members
  addMember: (data) => request('/api/admin/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => request(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMember: (id) => request(`/api/members/${id}`, { method: 'DELETE' }),

  // Email Hub
  sendEmail: (data) => request('/api/admin/emails/send', { method: 'POST', body: JSON.stringify(data) }),
};
