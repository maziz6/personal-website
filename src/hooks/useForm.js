import { useState, useCallback } from 'react';

/**
 * Custom hook for handling form state and validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function
 * @param {Function} onSubmitFn - Function to run on form submission
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues, validateFn, onSubmitFn) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear existing error for the field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const validationErrors = validateFn(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmitFn(values);
        setSubmitted(true);
        setValues(initialValues); // Reset values after submission
      } catch (error) {
        setSubmitError(error?.message || 'Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateFn, onSubmitFn, initialValues]);

  // Reset the entire form state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitted,
    submitError,
    handleChange,
    handleSubmit,
    resetForm,
    setValues
  };
};

export default useForm;
