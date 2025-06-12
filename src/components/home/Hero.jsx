import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import './Hero.css';

const Hero = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <section className={`hero ${darkMode ? 'dark' : ''}`}>
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Hi, I'm <span className="highlight">Momina Aziz</span>
          </h1>
          <h2 className="hero-subtitle">
            Software Engineer & Full Stack Developer
          </h2>
          <p className="hero-description">
            I'm a full stack developer and creative problem solver that grows at the intersection 
            between logic and design, bringing digital ideas to life with scalable, user-focused 
            solutions. Whether it's a powerful back-end or a slick front-end, I create software that 
            functions flawlessly and looks beautiful.
          </p>

          <div className="hero-cta">
            <Button 
              type="primary" 
              size="large"
              as="link"
              to="/projects"
              icon={<i className="fas fa-code"></i>}>
              View My Work
            </Button>
            
            <Button 
              type="secondary" 
              size="large"
              as="link"
              to="/contact"
              icon={<i className="fas fa-envelope"></i>}>
              Contact Me
            </Button>
          </div>

          <div className="hero-social">
            <a 
              href="https://github.com/maziz6" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>

            <a 
              href="https://www.linkedin.com/in/momina-aziz-094606221/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-container">
            <img src="/assets/images/momina-aziz-1.jpg" alt="Momina Aziz" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
