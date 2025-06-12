import React from 'react';
import { Link } from 'react-router-dom';
import './SectionTitle.css';

const SectionTitle = ({
  title = '',
  subtitle,
  align = 'center',
  withLink = false,
  linkText = '',
  linkTo = '#'
}) => {
  const words = title.trim().split(' ');

  return (
    <div className={`section-title ${align}`}>
      <h2 className="title">
        {words.map((word, index) => (
          <React.Fragment key={index}>
            {index !== 0 && ' '}
            {index === words.length - 1 ? <span>{word}</span> : word}
          </React.Fragment>
        ))}
      </h2>

      {subtitle && <p className="subtitle">{subtitle}</p>}

      {withLink && linkTo && (
        <Link to={linkTo} className="section-link">
          {linkText} <i className="fas fa-arrow-right"></i>
        </Link>
      )}
    </div>
  );
};

export default SectionTitle;
