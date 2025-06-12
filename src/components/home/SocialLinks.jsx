import React from 'react';
import './SocialLinks.css';

const SocialLinks = ({ size = 'medium' }) => {
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/momina-aziz-094606221/',
      icon: 'fab fa-linkedin',
      ariaLabel: 'Visit Momina Aziz on LinkedIn'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/maziz6',
      icon: 'fab fa-github',
      ariaLabel: 'Visit Momina Aziz on GitHub'
    }
    // Add more social profiles as needed
  ];

  return (
    <div className={`social-links social-links-${size}`}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="social-link"
          aria-label={link.ariaLabel}
          title={link.name}>
          <i className={link.icon}></i>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
