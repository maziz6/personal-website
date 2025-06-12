import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import Button from '../common/Button';
import './ContactForm.css';
import { submitContactForm } from '../../services/api';

const ContactForm = () => {
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      const response = await submitContactForm(formData);
      
      if (response.success) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Show success message for 5 seconds
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      }
    } catch (error) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: error.message || 'Failed to send message. Please try again.' 
      });
    }
  };

  return (
    <div className={`contact-form-container ${darkMode ? 'dark' : ''}`}>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
            disabled={status.loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
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

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={200}
            disabled={status.loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            disabled={status.loading}
          />
          <small className="char-count">
            {formData.message.length}/2000 characters
          </small>
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
            Message sent successfully! I'll get back to you soon.
          </div>
        )}

        <Button
          type="primary"
          size="large"
          fullWidth={true}
          disabled={status.loading}
          onClick={handleSubmit}
        >
          {status.loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Sending...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;