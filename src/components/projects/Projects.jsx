import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../../components/common/SectionTitle';
import ProjectFilter from './ProjectFilter';
import ProjectCard from './ProjectCard';
import './Projects.css';

const Projects = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeFilter, setActiveFilter] = useState('All');

  // 🧠 Sample project data (feel free to migrate this to a CMS or API later)
  const projects = [
    {
      id: 1,
      title: 'Personal Portfolio',
      category: 'Full-Stack',
      description:
        'Designed and developed a responsive personal portfolio website showcasing my skills, projects, and experience as a Software Engineer and aspiring Full Stack Dev.',
      techStack: ['HTML', 'CSS', 'JavaScript', 'React'],
      github: 'https://github.com/maziz6/personal-portfolio',
      demo: 'https://maziz6.github.io/personal-portfolio/',
    },
    {
      id: 2,
      title: 'Cottagecore Aesthetic Quiz',
      category: 'UX/UI',
      description:
        'A dreamy, multi-step HTML & CSS quiz to help users discover their cozy cottagecore aesthetic. Built with soft pastels, smooth transitions, and zero JavaScript.',
      techStack: ['HTML', 'CSS'],
      github: 'https://github.com/maziz6/cottagecore-quiz',
      demo: 'https://maziz6.github.io/cottagecore-quiz/',
    },
    {
      id: 3,
      title: 'Anime Merch Shop',
      category: 'UX/UI',
      description:
        'A vibrant anime-themed merch shop designed with responsive layouts and sleek UI elements. Features product listings, themed visuals, and a clean product grid.',
      techStack: ['HTML', 'CSS'],
      github: 'https://github.com/maziz6/anime-merch-shop',
      demo: 'https://maziz6.github.io/anime-merch-shop/',
    },
    {
      id: 4,
      title: 'Day in the Life',
      category: 'UX/UI',
      description:
        'A responsive self-care and reflection journal for the modern Muslim girl — built with HTML + CSS only. Features a prayer & productivity timeline, gratitude and dua fields, dark mode toggle, and animated floating petals for a calming aesthetic.',
      techStack: ['HTML', 'CSS'],
      github: 'https://github.com/maziz6/day-in-the-life',
      demo: 'https://maziz6.github.io/day-in-the-life/',
    },
  ];

  // 🧩 Filter categories
  const categories = ['All', 'Full-Stack', 'Machine Learning', 'UX/UI'];

  // 🔍 Filter logic
  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  return (
    <section className={`projects ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle title="My Projects" subtitle="What I've built" />

        <ProjectFilter
          categories={categories}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}/>

        <div className="projects-container">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="no-projects">
              <p>No projects found in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
