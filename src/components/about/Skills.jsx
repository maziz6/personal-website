import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../../components/common/SectionTitle';
import Card from '../../components/common/Card';
import './Skills.css';

const Skills = () => {
  const { darkMode } = useContext(ThemeContext);
  
  const skillCategories = [
    {
      title: 'Frontend Development',
      icon: 'fas fa-code',
      skills: [
        { name: 'HTML5 & CSS3', icon: 'fab fa-html5' },
        { name: 'JavaScript (ES6+)', icon: 'fab fa-js' },
        { name: 'React.js', icon: 'fab fa-react' },
        { name: 'Vue.js', icon: 'fab fa-vuejs' },
        { name: 'Responsive Design', icon: 'fas fa-mobile-alt' },
        { name: 'Bootstrap & Tailwind', icon: 'fab fa-bootstrap' }
      ]
    },
    {
      title: 'Backend Development',
      icon: 'fas fa-server',
      skills: [
        { name: 'Node.js', icon: 'fab fa-node-js' },
        { name: 'Express.js', icon: 'fas fa-network-wired' },
        { name: 'Python (Django/Flask)', icon: 'fab fa-python' },
        { name: 'RESTful APIs', icon: 'fas fa-exchange-alt' },
        { name: 'MongoDB', icon: 'fas fa-database' },
        { name: 'SQL Databases', icon: 'fas fa-database' }
      ]
    },
    {
      title: 'Tools & Others',
      icon: 'fas fa-tools',
      skills: [
        { name: 'Git & GitHub', icon: 'fab fa-git-alt' },
        { name: 'Webpack & Babel', icon: 'fas fa-cogs' },
        { name: 'Docker', icon: 'fab fa-docker' },
        { name: 'AWS', icon: 'fab fa-aws' },
        { name: 'Figma', icon: 'fab fa-figma' },
        { name: 'Testing (Jest, Mocha)', icon: 'fas fa-vial' }
      ]
    }
  ];

  return (
    <section className={`skills ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle 
          title="My Skills" 
          subtitle="Here are the technologies and tools I work with." 
        />
        
        <div className="skills-container">
          {skillCategories.map((category, index) => (
            <Card 
              key={index}
              className="card-skill"
              hoverable={true}
              elevated={true}
            >
              <Card.Body className="skill-category">
                <h3>
                  <i className={category.icon}></i> {category.title}
                </h3>
                <ul className="skill-list">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex}>
                      <i className={skill.icon}></i>
                      <span>{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;