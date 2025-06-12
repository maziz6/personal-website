
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  },
  page: {
    type: String,
    trim: true
  },
  sessionId: {
    type: String,
    trim: true
  },
  lastVisit: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Compound index for performance on daily queries
visitorSchema.index({ ipAddress: 1, createdAt: -1 });

const visitorStatsSchema = new mongoose.Schema({
  totalVisitors: {
    type: Number,
    default: 0,
    min: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0,
    min: 0
  },
  pageViews: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

const Visitor = mongoose.model('Visitor', visitorSchema);
const VisitorStats = mongoose.model('VisitorStats', visitorStatsSchema);

module.exports = { Visitor, VisitorStats };
