// server/routes/projects.js - Modernized 2025 Projects Routes
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult, query } = require('express-validator');

// Utils
const parseTech = tech => tech ? JSON.parse(tech) : [];
const boolify = val => val === 'true' || val === true || val === 1;

// Common query param validation rules
const projectQueryRules = [
  query('category').optional().isIn(['web', 'mobile', 'desktop', 'api', 'other']),
  query('featured').optional().isBoolean(),
  query('status').optional().isIn(['completed', 'in-progress', 'planned']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 })
];

   // GET /api/projects - List projects with filters
router.get('/', projectQueryRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { category, featured, status, limit = 20, offset = 0 } = req.query;
  const filters = [];
  const values = [];

  if (category) filters.push('category = ?'), values.push(category);
  if (featured !== undefined) filters.push('featured = ?'), values.push(boolify(featured) ? 1 : 0);
  if (status) filters.push('status = ?'), values.push(status);

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const totalQuery = `SELECT COUNT(*) as total FROM projects ${whereClause}`;
  const listQuery = `
    SELECT * FROM projects
    ${whereClause}
    ORDER BY featured DESC, sort_order ASC, created_at DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const total = await db.get(totalQuery, values);
    const projects = await db.all(listQuery, [...values, Number(limit), Number(offset)]);

    res.json({
      success: true,
      data: {
        projects: projects.map(p => ({ ...p, technologies: parseTech(p.technologies), featured: !!p.featured })),
        pagination: {
          total: total.total,
          limit: +limit,
          offset: +offset,
          hasMore: total.total > (+offset + +limit)
        }
      }
    });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db.get(
      `SELECT 
        id, title, description, short_description, image_url, 
        demo_url, github_url, technologies, category, status, 
        featured, sort_order, created_at, updated_at
       FROM projects 
       WHERE id = ?`,
      [id]
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Parse technologies JSON
    const parsedProject = {
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    };

    res.json({
      success: true,
      data: parsedProject
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
});

// GET /api/projects/featured/list - Get featured projects
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const projects = await db.all(
      `SELECT 
        id, title, description, short_description, image_url, 
        demo_url, github_url, technologies, category, status, 
        sort_order, created_at
       FROM projects 
       WHERE featured = 1 AND status = 'completed'
       ORDER BY sort_order ASC, created_at DESC
       LIMIT ?`,
      [limit]
    );

    // Parse technologies JSON for each project
    const parsedProjects = projects.map(project => ({
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : []
    }));

    res.json({
      success: true,
      data: parsedProjects
    });

  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured projects'
    });
  }
});

// GET /api/projects/categories/stats - Get project statistics by category
router.get('/categories/stats', async (req, res) => {
  try {
    const categoryStats = await db.all(`
      SELECT 
        category,
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_projects,
        COUNT(CASE WHEN featured = 1 THEN 1 END) as featured_projects
      FROM projects 
      GROUP BY category
      ORDER BY total_projects DESC
    `);

    const overallStats = await db.get(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_projects,
        COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_projects,
        COUNT(CASE WHEN featured = 1 THEN 1 END) as featured_projects
      FROM projects
    `);

    res.json({
      success: true,
      data: {
        overall: overallStats,
        by_category: categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics'
    });
  }
});

// POST /api/projects - Create new project (admin use)
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
  body('short_description').optional().trim().isLength({ max: 300 }).withMessage('Short description must be under 300 characters'),
  body('image_url').optional().isURL().withMessage('Image URL must be valid'),
  body('demo_url').optional().isURL().withMessage('Demo URL must be valid'),
  body('github_url').optional().isURL().withMessage('GitHub URL must be valid'),
  body('technologies').isArray().withMessage('Technologies must be an array'),
  body('category').isIn(['web', 'mobile', 'desktop', 'api', 'other']).withMessage('Invalid category'),
  body('status').optional().isIn(['completed', 'in-progress', 'planned']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title, description, short_description, image_url, demo_url, github_url,
      technologies, category, status = 'completed', featured = false, sort_order = 0
    } = req.body;

    const result = await db.run(
      `INSERT INTO projects (
        title, description, short_description, image_url, demo_url, github_url,
        technologies, category, status, featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, short_description, image_url, demo_url, github_url,
        JSON.stringify(technologies), category, status, featured ? 1 : 0, sort_order
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        id: result.id,
        title
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
});

// PUT /api/projects/:id - Update project (admin use)
router.put('/:id', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
  body('short_description').optional().trim().isLength({ max: 300 }).withMessage('Short description must be under 300 characters'),
  body('image_url').optional().isURL().withMessage('Image URL must be valid'),
  body('demo_url').optional().isURL().withMessage('Demo URL must be valid'),
  body('github_url').optional().isURL().withMessage('GitHub URL must be valid'),
  body('technologies').isArray().withMessage('Technologies must be an array'),
  body('category').isIn(['web', 'mobile', 'desktop', 'api', 'other']).withMessage('Invalid category'),
  body('status').optional().isIn(['completed', 'in-progress', 'planned']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a positive integer')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      title, description, short_description, image_url, demo_url, github_url,
      technologies, category, status, featured, sort_order
    } = req.body;

    const result = await db.run(
      `UPDATE projects SET 
        title = ?, description = ?, short_description = ?, image_url = ?, 
        demo_url = ?, github_url = ?, technologies = ?, category = ?, 
        status = ?, featured = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, description, short_description, image_url, demo_url, github_url,
        JSON.stringify(technologies), category, status, featured ? 1 : 0, sort_order, id
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully'
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

// DELETE /api/projects/:id - Delete project (admin use)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.run('DELETE FROM projects WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

module.exports = router;