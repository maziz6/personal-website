import React, { useEffect, useContext } from 'react';
import { Analytics } from '../services/analytics';
import { ThemeContext } from '../context/ThemeContext';

import About from '../components/about/About';
import Skills from '../components/about/Skills';
import SectionTitle from '../components/common/SectionTitle';

const AboutPage = () => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    Analytics.trackPageView('about');
    document.title = 'Portfolio | About Me';
    window.scrollTo(0, 0);
  }, []);

  const education = [
    {
      id: 'edu1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Northeastern Illinois University',
      period: '2022 - Present',
      description:
        'Focus on software engineering, machine learning, and web development. Relevant coursework includes Data Structures, Algorithms, Database Systems, and Web Development.'
    },
    {
      id: 'edu2',
      degree: 'High School Dimploma',
      institution: 'Senn High School',
      period: '2016 - 2020',
      description:
        'General education and foundation courses with an emphasis on mathematics and computer science principles.',
    },
  ];

  const experience = [
    {
      id: 'exp1',
      position: 'Software Engineering Freelancer',
      company: 'Self-employed',
      period: '2023 - Present',
      description:
        'Working with clients to develop web applications, perform UI/UX design, and implement database solutions. Projects include e-commerce platforms.',
    },
   /*{
      id: 'exp2',
      position: 'Web Development Intern',
      company: 'Tech Solutions Inc.',
      period: 'Summer 2023',
      description:
        'Assisted in the development of responsive websites, collaborated with design teams, and implemented frontend features using HTML, CSS, JavaScript, and React.',
    },*/
  ];

  return (
    <div className={`page about-page ${darkMode ? 'dark' : ''}`}>
      <section className="about-extended section-container">
        <About extended />
      </section>

      <section className="skills-extended section-container">
        <Skills extended />
      </section>

      <section className="education-section section-container">
        <SectionTitle
          title="Education"
          subtitle="My academic background and learning journey"
          align="left"/>
        <div className="timeline">
          {education.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{item.degree}</h3>
                <h4>{item.institution}</h4>
                <p className="timeline-period">{item.period}</p>
                <p className="timeline-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="experience-section section-container">
        <SectionTitle
          title="Experience"
          subtitle="My professional journey so far"
          align="left"/>
        <div className="timeline">
          {experience.map((item) => (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>{item.position}</h3>
                <h4>{item.company}</h4>
                <p className="timeline-period">{item.period}</p>
                <p className="timeline-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
