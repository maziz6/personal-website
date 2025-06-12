// controllers/feedbackController.js - 2025-Ready Feedback Logic
const Feedback = require('../models/Feedback');
const { validationResult } = require('express-validator');
const chalk = require('chalk');

exports.submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, rating, category, feedback, isPublic = false } = req.body;

    const entry = await Feedback.create({
      name,
      email,
      rating,
      category,
      feedback,
      isPublic,
      approved: false,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: '🎉 Thank you for your feedback! Pending review.',
      data: {
        id: entry._id,
        rating: entry.rating,
        category: entry.category
      }
    });
  } catch (err) {
    console.error(chalk.red('❌ Feedback submission error:'), err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Try again later.'
    });
  }
};

exports.getPublicFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ isPublic: true, approved: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name rating category feedback createdAt');

    res.json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error(chalk.red('❌ Failed to get public feedback:'), err);
    res.status(500).json({
      success: false,
      message: 'Could not fetch feedback at this time.'
    });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    const [overallStats = {}, categoryStats = []] = await Promise.all([
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingDistribution: { $push: '$rating' }
          }
        }
      ]).then(res => res[0] || {}),

      Feedback.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overall: {
          totalFeedback: overallStats.totalFeedback || 0,
          averageRating: Number(overallStats.averageRating || 0).toFixed(2),
          ratingDistribution: overallStats.ratingDistribution || []
        },
        byCategory: categoryStats
      }
    });
  } catch (err) {
    console.error(chalk.red('❌ Failed to get feedback stats:'), err);
    res.status(500).json({
      success: false,
      message: 'Feedback stats unavailable. Please retry later.'
    });
  }
};
