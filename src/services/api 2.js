// API service to interact with the backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic request handler with better error handling
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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Contact API
export const submitContactForm = async (formData) => {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};

// Feedback API
export const submitFeedback = async (feedbackData) => {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
};

export const getPublicFeedback = async () => {
  return request('/feedback/public');
};

export const getFeedbackStats = async () => {
  return request('/feedback/stats');
};

// Visitor API
export const trackVisitor = async (visitorData) => {
  return request('/visitor/track', {
    method: 'POST',
    body: JSON.stringify(visitorData),
  });
};

export const getVisitorCount = async () => {
  return request('/visitor/stats');
};

// Legacy function for backward compatibility
export const incrementVisitorCount = async () => {
  const sessionId = Date.now().toString();
  return trackVisitor({
    page: window.location.pathname,
    referrer: document.referrer,
    sessionId
  });
};

// Projects API
export const getProjects = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const queryString = queryParams.toString();
  const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;
  
  return request(endpoint);
};

export const getProject = async (id) => {
  return request(`/projects/${id}`);
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    return response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

