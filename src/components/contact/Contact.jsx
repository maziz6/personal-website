import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../../components/common/SectionTitle';
import './Contact.css';

const Contact = () => {
  const { darkMode } = useContext(ThemeContext);

  const contactInfoItems = [
    {
      icon: '📧',
      title: 'Email',
      value: (
        <a href="mailto:mominaziz08@gmail.com" className="contact-link">
          mominaziz08@gmail.com
        </a>
      ),
    },
    {
      icon: '📱',
      title: 'Phone',
      value: (
        <a href="tel:+17738374940" className="contact-link">
          +1 (773) 837-4940
        </a>
      ),
    },
    {
      icon: '📍',
      title: 'Location',
      value: 'Chicago, IL',
    },
  ];

  return (
    <section className={`contact-section ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle 
          title="Contact Me" 
          subtitle="Let's work together" 
          align="center"/>
        
        <div className="contact-container">
          <div className="contact-info">
            {contactInfoItems.map(({ icon, title, value }, index) => (
              <div key={index} className="info-item">
                <div className="info-icon" aria-hidden="true">{icon}</div>
                <div className="info-content">
                  <h4>{title}</h4>
                  <p>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
