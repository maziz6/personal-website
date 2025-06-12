import React from 'react';
import './Button.css';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  type = 'primary',
  size = 'medium',
  as = 'button',
  to,
  href,
  onClick,
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  className = '',
  ...props
}) => {
  // Determine the CSS classes to apply
  const buttonClasses = [
    'btn',
    `btn-${type}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    icon ? `btn-with-icon icon-${iconPosition}` : '',
    className
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Prepare the button content
  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </>
  );

  // Render the appropriate element based on the 'as' prop
  if (as === 'link' && to) {
    return (
      <Link to={to} className={buttonClasses} {...props}>
        {content}
      </Link>
    );
  } else if (as === 'a' && href) {
    return (
      <a href={href} className={buttonClasses} {...props}>
        {content}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {content}
      </button>
    );
  }
};

export default Button;
