import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import './RatingSystem.css';

const RatingSystem = ({ rating = 0, onRatingChange }) => {
  const { darkMode } = useContext(ThemeContext);
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index) => {
    onRatingChange(index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRatingChange(index);

    }
  };

  const ratingDescriptions = [
    '',       // index 0 is unused
    'Poor',
    'Fair',
    'Good',
    'Very Good',
    'Excellent'
  ];

  return (
    <div className={`rating-system ${darkMode ? 'dark' : ''}`}>
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            className={`star ${(hoverRating || rating) >= index ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="button"
            tabIndex={0}
            aria-label={`Rate ${index} out of 5 stars`}>
            <i className="fas fa-star"></i>
          </span>
        ))}
      </div>

      {(hoverRating > 0 || rating > 0) && (
        <div className="rating-description">
          {ratingDescriptions[hoverRating || rating]}
        </div>
      )}
    </div>
  );
};

export default RatingSystem;
