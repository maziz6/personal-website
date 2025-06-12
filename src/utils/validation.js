/**
 * Validates if a string is a valid email address
 * /**
 * Validates an email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
export const validateEmail = (email) => {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};

/**
 * Validates if a string is not empty
 * @param {string} value - Value to check
 * @returns {boolean} True if value is not empty, false otherwise
 */
export const validateRequired = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates if a string meets a minimum length
 * @param {string} value - Value to check
 * @param {number} minLength - Minimum required length
 * @returns {boolean} True if valid, false otherwise
 */
export const validateMinLength = (value, minLength) => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

/**
 * Validates if a string does not exceed a maximum length
 * @param {string} value - Value to check
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if valid, false otherwise
 */
export const validateMaxLength = (value, maxLength) => {
  return typeof value === 'string' && value.trim().length <= maxLength;
};

/**
 * Validates if a value is numeric
 * @param {*} value - Value to check
 * @returns {boolean} True if number, false otherwise
 */
export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validates a basic international phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePhone = (phone) => {
  const sanitized = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(sanitized);
};

/**
 * Validates a contact form's field values
 * @param {Object} values - Contact form values
 * @returns {Object} Errors object
 */
export const validateContactForm = (values) => {
  const errors = {};

  if (!validateRequired(values.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(values.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Email is invalid';
  }

  if (!validateRequired(values.message)) {
    errors.message = 'Message is required';
  } else if (!validateMinLength(values.message, 10)) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
};

/**
 * Validates feedback form values
 * @param {Object} values - Feedback form values
 * @returns {Object} Errors object
 */
export const validateFeedbackForm = (values) => {
  const errors = {};

  if (!validateRequired(values.name)) {
    errors.name = 'Name is required';
  }

  if (!values.rating || values.rating === 0) {
    errors.rating = 'Please select a rating';
  }

  if (!validateRequired(values.feedback)) {
    errors.feedback = 'Feedback is required';
  } else if (!validateMinLength(values.feedback, 10)) {
    errors.feedback = 'Feedback must be at least 10 characters';
  }

  return errors;
};
