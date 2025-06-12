import { useState, useEffect } from 'react';
import { getVisitorCount } from '../services/api';

/**
 * Custom hook to fetch and manage visitor count data
 * @returns {Object} Object containing visitor count, loading state, and error (if any)
 */
const useVisitorCount = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        setLoading(true);
        const count = await getVisitorCount(); // assuming API returns a number
        if (typeof count === 'number') {
          setVisitorCount(count);
        } else {
          throw new Error('Invalid visitor count format');
        }
      } catch (err) {
        console.error('Error fetching visitor count:', err);
        setError(err.message || 'Failed to fetch visitor count');
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorCount();
  }, []);

  return { visitorCount, loading, error };
};

export default useVisitorCount;
