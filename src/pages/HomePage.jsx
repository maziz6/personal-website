import React, { useEffect, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { ThemeContext } from '../context/ThemeContext';
import { VisitorContext } from '../context/VisitorContext';

import Hero from '../components/home/Hero';
import About from '../components/about/About';
import Skills from '../components/about/Skills';
import Projects from '../components/projects/Projects';
import Contact from '../components/contact/Contact';
import Testimonials from '../components/freelance/Testimonials';
import Feedback from '../components/feedback/Feedback';

const HomePage = () => {
  const { darkMode } = useContext(ThemeContext);
  const { visitorCount } = useContext(VisitorContext);

  useEffect(() => {
    Analytics.trackPageView(window.location.pathname);
    document.title = 'Portfolio | Home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className={`page home-page ${darkMode ? 'dark' : ''}`}>
      <section id="hero" className="section-container">
        <Hero />
      </section>

      <section id="about" className="section-container">
        <About preview={true} />
      </section>

      <section id="skills" className="section-container">
        <Skills preview={true} />
      </section>

      <section id="projects" className="section-container">
        <Projects />
      </section>

      <section id="testimonials" className="section-container">
        <Testimonials />
      </section>

      <section id="contact" className="section-container">
        <Contact />
      </section>

      <section id="feedback" className="section-container">
        <Feedback />
      </section>

      {visitorCount > 0 && (
        <aside className="visitor-counter" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <span>👀 Visitor count: {visitorCount.toLocaleString()}</span>
        </aside>
      )}
    </main>
  );
};

export default HomePage;
