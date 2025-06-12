import React from 'react';
import './Card.css';

const Card = ({
  children,
  variant = 'default',
  hoverable = false,
  elevated = false,
  className = '',
  onClick = null,
  ...props
}) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    hoverable && 'card-hoverable',
    elevated && 'card-elevated',
    onClick && 'card-clickable',
    className
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Subcomponents
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

Card.Image = ({ src, alt = '', className = '', ...props }) => (
  <div className={`card-image ${className}`} {...props}>
    <img src={src} alt={alt} />
  </div>
);

export default Card;
