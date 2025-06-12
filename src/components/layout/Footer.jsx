import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);
  const currentYear = new Date().getFullYear();
  const footerClass = darkMode ? 'footer footer-dark' : 'footer footer-light';

  return (
    <footer className={footerClass}>
      <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Momina.</Link>
            <p className="footer-tagline">
              Creating innovative software solutions with creativity and precision.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Me</Link></li>
                <li><Link to="/projects">Projects</Link></li>
                <li><Link to="/freelance">Freelance</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href="mailto:mominaziz08@gmail.com">
                    <i className="fas fa-envelope"></i> mominaziz08@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+17738374940">
                    <i className="fas fa-phone"></i> +1 (773) 837-4940
                  </a>
                </li>
                <li>
                  <span>
                    <i className="fas fa-map-marker-alt"></i> Chicago, IL
                  </span>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h4>Social</h4>
              <div className="footer-social-links">
                <a
                  href="https://www.linkedin.com/in/momina-aziz-094606221/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a
                  href="https://github.com/maziz6"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Momina Aziz. All rights reserved.</p>
          <div className="footer-feedback">
            <Link to="/feedback" className="feedback-link">
              <i className="fas fa-star"></i> Rate my portfolio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
