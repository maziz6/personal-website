const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      'Please enter a valid email address'
    ]
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['design', 'functionality', 'content', 'overall'],
      message: 'Category must be one of: design, functionality, content, overall'
    }
  },
  feedback: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minlength: [10, 'Feedback must be at least 10 characters'],
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

// Optional: Index for faster queries on approval/public feedback
feedbackSchema.index({ isPublic: 1, approved: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
