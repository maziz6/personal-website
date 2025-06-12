import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../../components/common/SectionTitle';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import './Freelance.css';

const Freelance = () => {
  const { darkMode } = useContext(ThemeContext);

  const services = [
    {
      icon: '💻',
      title: 'Web Development',
      description: 'Custom responsive websites and web applications built with modern technologies like React, Node.js, and more.',
      price: 'Starting at $50/hr',
    },
    {
      icon: '🎨',
      title: 'UI/UX Design',
      description: 'User-centered design solutions focusing on intuitive interfaces, wireframing, prototyping, and usability testing.',
      price: 'Starting at $45/hr',
    },
    {
      icon: '📱',
      title: 'Full-Stack Development',
      description: 'End-to-end development solutions combining front-end and back-end expertise for complete applications.',
      price: 'Starting at $60/hr',
    },
    {
      icon: '🤖',
      title: 'Machine Learning',
      description: 'Data analysis, model development, and implementation of machine learning solutions for your business needs.',
      price: 'Starting at $65/hr',
    }
  ];

  return (
    <section className={`freelance-section ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle 
          title="Freelance Services" 
          subtitle="Professional Solutions For Your Projects" 
          align="center"/>

        <div className="freelance-intro">
          <p>
            As a freelance software engineer, I offer comprehensive development services
            tailored to your specific needs. With expertise in various technologies and domains,
            I help turn your ideas into reality with clean, efficient, and scalable solutions.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <Card key={index} variant="service" hoverable elevated>
              <div className="service-icon" aria-hidden="true">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-price">{service.price}</div>
              <Button size="small" variant="outline">Learn More</Button>
            </Card>
          ))}
        </div>

        <div className="cta-container">
          <Card variant="cta" elevated>
            <h3>Ready to start a project?</h3>
            <p>Let's discuss how I can help bring your ideas to life.</p>
            <Button 
              variant="primary"
              size="large"
              icon="✉️"
              as="link"
              to="/contact">
              Contact Me
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Freelance;
