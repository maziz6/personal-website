const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  technologies: {
    type: [String],
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one technology must be listed'
    },
    set: arr => arr.map(t => t.trim())
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: {
      values: ['web', 'mobile', 'desktop', 'ai', 'other'],
      message: 'Category must be one of: web, mobile, desktop, ai, other'
    }
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'planned'],
    default: 'completed'
  },
  githubUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/.+$/, 'Invalid GitHub URL']
  },
  liveUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+$/, 'Invalid live site URL']
  },
  imageUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+$/, 'Invalid image URL']
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexing featured and category for optimized filtering
projectSchema.index({ featured: 1, category: 1, order: 1 });

module.exports = mongoose.model('Project', projectSchema);
