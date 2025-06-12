import React, { useEffect, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { ThemeContext } from '../context/ThemeContext';
import Projects from '../components/projects/Projects';

const ProjectsPage = () => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Track page view for analytics
    Analytics.trackPageView('projects');

    // Set document title
    document.title = 'Portfolio | Projects';

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`page projects-page ${darkMode ? 'dark' : ''}`}>
      <section className="projects-section section-container">
        <Projects showFilter={true} />
      </section>
    </div>
  );
};

export default ProjectsPage;
