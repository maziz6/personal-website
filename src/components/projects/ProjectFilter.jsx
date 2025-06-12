import React from 'react';
import PropTypes from 'prop-types';
import './ProjectFilter.css';

const ProjectFilter = ({ categories, activeFilter, setActiveFilter }) => {
  return (
    <div className="filter-buttons" role="tablist" aria-label="Project categories">
      {categories.map((category) => (
        <button
          key={category}
          className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
          onClick={() => setActiveFilter(category)}
          role="tab"
          aria-selected={activeFilter === category}>
          {category}
        </button>
      ))}
    </div>
  );
};

ProjectFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeFilter: PropTypes.string.isRequired,
  setActiveFilter: PropTypes.func.isRequired,
};

export default ProjectFilter;
