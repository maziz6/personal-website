// controllers/projectController.js - Modernized for 2025
const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const chalk = require('chalk');

exports.getProjects = async (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;
    const query = {};

    if (category && category.toLowerCase() !== 'all') {
      query.category = category;
    }
    if (featured === 'true') {
      query.featured = true;
    }

    const projects = await Project.find(query)
      .sort({ sort_order: 1, createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    console.error(chalk.red('❌ Failed to fetch projects:'), err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(chalk.red('❌ Failed to fetch project:'), err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};
