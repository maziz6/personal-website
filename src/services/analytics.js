import { trackPageView, trackEvent } from './api';

export class Analytics {
  static init() {
    // Initialize analytics
    console.log('Analytics initialized');
    this.trackPageView();
    this.setupEventListeners();
  }

  static async trackPageView(path = null) {
    try {
      const pageData = {
        path: path || window.location.pathname,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      };

      const response = await trackPageView(pageData);
      if (!response.success) {
        console.warn('Failed to track page view:', response.error);
      }
    } catch (error) {
      console.warn('Analytics trackPageView error:', error);
    }
  }

  static async trackCustomEvent(eventName, eventData = {}) {
    try {
      const fullEventData = {
        name: eventName,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId(),
        ...eventData
      };

      const response = await trackEvent(fullEventData);
      if (!response.success) {
        console.warn('Failed to track event:', response.error);
      }
    } catch (error) {
      console.warn('Analytics trackCustomEvent error:', error);
    }
  }

  static setupEventListeners() {
    // Track clicks on external links
    document.addEventListener('click', (event) => {
      try {
        const link = event.target.closest('a');
        if (link && link.href) {
          const isExternal = !link.href.startsWith(window.location.origin);
          if (isExternal) {
            this.trackCustomEvent('external_link_click', {
              url: link.href,
              text: link.textContent?.trim() || 'Unknown'
            });
          }
        }
      } catch (error) {
        console.warn('Error tracking link click:', error);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      try {
        const form = event.target;
        if (form.tagName === 'FORM') {
          this.trackCustomEvent('form_submit', {
            formId: form.id || 'unknown',
            formClass: form.className || 'unknown'
          });
        }
      } catch (error) {
        console.warn('Error tracking form submit:', error);
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      try {
        const scrollDepth = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
          maxScrollDepth = scrollDepth;
          this.trackCustomEvent('scroll_depth', {
            depth: scrollDepth,
            page: window.location.pathname
          });
        }
      } catch (error) {
        console.warn('Error tracking scroll depth:', error);
      }
    };

    // Throttle scroll tracking
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(trackScrollDepth, 500);
    });
  }

  static getSessionId() {
    try {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      // Fallback if sessionStorage is not available
      return 'session_' + Date.now() + '_fallback';
    }
  }

  static trackButtonClick(buttonName, additionalData = {}) {
    this.trackCustomEvent('button_click', {
      button: buttonName,
      ...additionalData
    });
  }

  static trackContactFormSubmit(formData) {
    this.trackCustomEvent('contact_form_submit', {
      hasName: !!formData.name,
      hasEmail: !!formData.email,
      hasMessage: !!formData.message,
      messageLength: formData.message?.length || 0
    });
  }

  static trackProjectView(projectId, projectTitle) {
    this.trackCustomEvent('project_view', {
      projectId,
      projectTitle
    });
  }

  static trackDownload(fileName, fileType) {
    this.trackCustomEvent('file_download', {
      fileName,
      fileType
    });
  }

  static trackError(error, context = '') {
    this.trackCustomEvent('javascript_error', {
      error: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      context,
      url: window.location.href
    });
  }

  // Time tracking for page engagement
  static startTimeTracking() {
    this.pageStartTime = Date.now();
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      if (this.pageStartTime) {
        const timeSpent = Date.now() - this.pageStartTime;
        this.trackCustomEvent('page_time', {
          timeSpent: Math.round(timeSpent / 1000), // in seconds
          page: window.location.pathname
        });
      }
    });
  }

  // Visibility tracking
  static trackVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      this.trackCustomEvent('visibility_change', {
        hidden: document.hidden,
        page: window.location.pathname
      });
    });
  }
}

// Auto-initialize analytics when the module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Analytics.init();
      Analytics.startTimeTracking();
      Analytics.trackVisibilityChange();
    });
  } else {
    Analytics.init();
    Analytics.startTimeTracking();
    Analytics.trackVisibilityChange();
  }
}

export default Analytics;