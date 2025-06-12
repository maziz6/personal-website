import React, { useEffect, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { ThemeContext } from '../context/ThemeContext';
import Contact from '../components/contact/Contact';
import SocialLinks from '../components/home/SocialLinks';
import Feedback from '../components/feedback/Feedback';

const ContactPage = () => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    Analytics.trackPageView('contact');
    document.title = 'Portfolio | Contact';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`page contact-page ${darkMode ? 'dark' : ''}`}>
      
      <section className="contact-section section-container">
        <Contact />
      </section>
      
      <section className="connect-section section-container">
        <div className="connect-container">
          <h2>Connect With Me</h2>
          <p>Follow me on social media to stay updated with my latest projects and activities.</p>
          <SocialLinks size="large" />
        </div>
      </section>
      
      <section className="feedback-page-section section-container">
        <Feedback />
      </section>
      
      <section className="map-section section-container">
        <div className="map-container">
          <h2>Location</h2>
          <p>Based in Chicago, IL — Available for remote work worldwide.</p>
          <div className="map-embed">
            {/* Replace this with an actual map if needed */}
            <div className="map-placeholder">
              <img 
                src="/assets/images/chicago-map.jpg" 
                alt="Map showing Chicago location" 
                className="placeholder-img"/>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
