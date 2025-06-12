import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import SectionTitle from '../../components/common/SectionTitle';
import Card from '../../components/common/Card';
import './Testimonials.css';

const Testimonials = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'John Smith',
      role: 'CEO, Tech Startup',
      content: 'Momina delivered exceptional work on our web application. Her attention to detail and technical expertise resulted in a product that exceeded our expectations.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      content: 'Working with Momina was a great experience. She understood our requirements quickly and delivered a beautiful, functional website.',
      rating: 5,
    },
    {
      id: 3,
      name: 'David Chen',
      role: 'E-commerce Owner',
      content: 'Momina helped us implement crucial features for our online store that significantly improved user experience and conversion rates.',
      rating: 4.5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const renderStars = (ratingValue) => {
    const rating = Number(ratingValue) || 0;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key={`half-${fullStars}`} className="star half">★</span>);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  return (
    <section className={`testimonials-section ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <SectionTitle 
          title="Client Testimonials" 
          subtitle="What People Say About My Work" 
          align="center"/>

        <div className="testimonials-container">
          <div className="testimonials-slider">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-slide ${index === activeIndex ? 'active' : ''}`}>
                <Card variant="testimonial" elevated>
                  <div className="testimonial-content">
                    <div className="quote-icon" aria-hidden="true">"</div>
                    <p>{testimonial.content}</p>
                    <div className="rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
