// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return { success: false, error: error.message, status: error.status || 500 };
  }
};

// Visitor APIs
export const getVisitorCount = () => request('/visitor/count');
export const incrementVisitorCount = () => request('/visitor/increment', { method: 'POST' });
export const getVisitorStats = () => request('/visitor/stats');

// Contact APIs
export const submitContactForm = (data) => request('/contact', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const getContactMessages = (page = 1, limit = 10) =>
  request(`/contact/messages?page=${page}&limit=${limit}`);

// Feedback APIs
export const submitFeedback = (data) => request('/feedback', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const getFeedbackStats = () => request('/feedback/stats');
export const getTestimonials = () => request('/feedback/testimonials');

// Projects APIs
export const getProjects = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val) params.append(key, val);
  });

  return request(`/projects${params.toString() ? `?${params}` : ''}`);
};
export const getProjectById = (id) => request(`/projects/${id}`);
export const createProject = (data) => request('/projects', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const updateProject = (id, data) => request(`/projects/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});
export const deleteProject = (id) => request(`/projects/${id}`, { method: 'DELETE' });

// Analytics APIs
export const trackPageView = (data) => request('/analytics/pageview', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const trackEvent = (data) => request('/analytics/event', {
  method: 'POST',
  body: JSON.stringify(data)
});
export const getAnalyticsData = (timeframe = '7d') => request(`/analytics/data?timeframe=${timeframe}`);

// Admin APIs
export const adminLogin = (credentials) => request('/admin/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});
export const getAdminDashboard = (token) => request('/admin/dashboard', {
  headers: { Authorization: `Bearer ${token}` }
});
export const updateSettings = (settings, token) => request('/admin/settings', {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify(settings)
});

// Health check
export const healthCheck = () => request('/health');

// File Upload
export const uploadFile = async (file, type = 'project') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

    const data = await response.json();
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 500 };
  }
};

// ✅ Properly defined default export (no anonymous export errors)
const api = {
  getVisitorCount,
  incrementVisitorCount,
  getVisitorStats,
  submitContactForm,
  getContactMessages,
  submitFeedback,
  getFeedbackStats,
  getTestimonials,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  trackPageView,
  trackEvent,
  getAnalyticsData,
  adminLogin,
  getAdminDashboard,
  updateSettings,
  healthCheck,
  uploadFile
};

export default api;

