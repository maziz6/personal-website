import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const { darkMode } = useContext(ThemeContext);
  const { title, description, techStack, demo, github } = project;

  return (
    <Card
      variant="default"
      hoverable
      elevated
      className={`project-card ${darkMode ? 'dark' : ''}`}>
      <Card.Body>
        <h3 className="project-title">{title}</h3>
        <p className="project-description">{description}</p>

        {techStack?.length > 0 && (
          <div className="project-tags">
            {techStack.map((tag, index) => (
              <span key={index} className="project-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="project-links">
          {demo && (
            <Button
              as="a"
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              type="primary"
              size="small"
              icon={<i className="fas fa-external-link-alt"></i>}>
              Live Demo
            </Button>
          )}
          {github && (
            <Button
              as="a"
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              type="secondary"
              size="small"
              icon={<i className="fab fa-github"></i>}>
              View Code
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
