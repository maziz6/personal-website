import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../../components/common/SectionTitle';
import Button from '../../components/common/Button';
import './About.css';

  const About = ({ extended, preview = true }) => {
    const { darkMode } = useContext(ThemeContext);
  
    if (!extended && !preview) return null;

  return (
    <section className={`about ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle 
          title="About Me" 
          subtitle="Get to know me better"
        />
        <div className="about-content">
          <p>
            I am currently pursuing my degree at Northeastern Illinois University and 
            working as a software engineering freelancer.
          </p>
          <p>
            With a strong foundation in programming languages such as <span className="highlight">Java</span>, 
            <span className="highlight"> Python</span>, <span className="highlight"> SQL</span>,
            and front-end technologies like <span className="highlight"> HTML</span>,
            <span className="highlight"> CSS</span>, <span className="highlight"> Javascript</span>, and 
            <span className="highlight"> React</span>, I am committed to crafting user-friendly, efficient, 
            and scalable applications.
          </p> 
          <p>
            Outside of my technical pursuits, my dream is to own a business and create 
            meaningful innovations that help people and inspire future generations.
          </p>
          <div className="about-cta">
            <Button 
              as="/public/asserts/images/resume/Professional Resume.pdf"
              href="/assets/"
              type="primary"
              size="medium"
              target="_blank"
              rel="noopener noreferrer">
              Download My Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;