
import React, { createContext, useState, useEffect } from 'react';
import { getVisitorCount, incrementVisitorCount } from '../services/api';

export const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize visitor tracking
  useEffect(() => {
    initializeVisitorTracking();
  }, []);

  const initializeVisitorTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if this is a new visitor (using sessionStorage to track within session)
      const hasVisited = sessionStorage.getItem('portfolio_visited');
      
      if (!hasVisited) {
        // New visitor - increment count
        const response = await incrementVisitorCount();
        if (response.success) {
          setVisitorCount(response.data.count);
          sessionStorage.setItem('portfolio_visited', 'true');
        } else {
          throw new Error('Failed to increment visitor count');
        }
      } else {
        // Returning visitor - just get count
        const response = await getVisitorCount();
        if (response.success) {
          setVisitorCount(response.data.count);
        } else {
          throw new Error('Failed to get visitor count');
        }
      }
    } catch (err) {
      console.error('Visitor tracking error:', err);
      setError(err.message);
      // Set a default count if API fails
      setVisitorCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshVisitorCount = async () => {
    try {
      const response = await getVisitorCount();
      if (response.success) {
        setVisitorCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to refresh visitor count:', err);
    }
  };

  const contextValue = {
    visitorCount,
    loading,
    error,
    refreshVisitorCount,
    initializeVisitorTracking
  };

  return (
    <VisitorContext.Provider value={contextValue}>
      {children}
    </VisitorContext.Provider>
  );
};