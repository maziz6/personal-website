import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../common/SectionTitle';
import RatingSystem from './RatingSystem';
import Button from '../common/Button';
import { submitFeedback } from '../../services/api';
import './Feedback.css';

const Feedback = () => {
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    category: '',
    feedback: '',
    isPublic: false
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const categories = [
    { value: 'design', label: 'Design & UI' },
    { value: 'functionality', label: 'Functionality' },
    { value: 'content', label: 'Content Quality' },
    { value: 'overall', label: 'Overall Experience' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: 'Please provide a rating' 
      });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await submitFeedback(formData);
      
      if (response.success) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({
          name: '',
          email: '',
          rating: 0,
          category: '',
          feedback: '',
          isPublic: false
        });

        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      }
    } catch (error) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: error.message || 'Failed to submit feedback. Please try again.' 
      });
    }
  };

  return (
    <section className={`feedback-section ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle
          title="Share Your Feedback"
          subtitle="Your feedback helps me improve and grow. I'd love to hear your thoughts!"
        />

        <div className="feedback-container">
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={status.loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={status.loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rating *</label>
                <RatingSystem
                  rating={formData.rating}
                  onRatingChange={handleRatingChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={status.loading}
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="feedback">Your Feedback *</label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                required
                rows={5}
                maxLength={1000}
                disabled={status.loading}
                placeholder="Share your thoughts, suggestions, or experiences..."
              />
              <small className="char-count">
                {formData.feedback.length}/1000 characters
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  disabled={status.loading}
                />
                <span className="checkmark"></span>
                I allow this feedback to be displayed publicly on your website
              </label>
            </div>

            {status.error && (
              <div className="form-message error">
                <i className="fas fa-exclamation-circle"></i>
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="form-message success">
                <i className="fas fa-check-circle"></i>
                Thank you for your feedback! It means a lot to me.
              </div>
            )}

            <Button
              type="primary"
              size="large"
              fullWidth={true}
              disabled={status.loading || formData.rating === 0}
            >
              {status.loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-heart"></i>
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Feedback;