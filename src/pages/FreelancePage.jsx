import React, { useEffect, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { ThemeContext } from '../context/ThemeContext';
import Freelance from '../components/freelance/Freelance';
import Testimonials from '../components/freelance/Testimonials';

const FreelancePage = () => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Track page view for analytics
    Analytics.trackPageView('freelance');

    // Set page title
    document.title = 'Freelance Services | Momina Aziz';

    // Update meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Freelance software engineering and development services offered by Momina Aziz, including web development, UI/UX design, and machine learning solutions.'
      );
    }
  }, []);

  return (
    <div className={`page freelance-page ${darkMode ? 'dark' : ''}`}>
      <Freelance />
      <Testimonials />
    </div>
  );
};

export default FreelancePage;
