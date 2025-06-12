// server/scripts/initDb.js - Database initialization script
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/portfolio.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

async function initializeDatabase() {
  console.log('🚀 Initializing database...');

  try {
    // Enable foreign key constraints
    await runQuery('PRAGMA foreign_keys = ON');

    // Create tables
    await createTables();
    
    // Create default admin user
    await createDefaultAdmin();
    
    // Insert sample data (optional)
    await insertSampleData();
    
    console.log('✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    db.close();
  }
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function createTables() {
  console.log('📋 Creating tables...');

  // Visitors table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT,
      user_agent TEXT,
      country TEXT,
      city TEXT,
      referrer TEXT,
      page_path TEXT DEFAULT '/',
      session_id TEXT,
      first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      visit_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contact messages table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      project_type TEXT,
      budget_range TEXT,
      timeline TEXT,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied')),
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Feedback table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      company TEXT,
      position TEXT,
      message TEXT NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      project_type TEXT,
      approved BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Projects table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      long_description TEXT,
      category TEXT NOT NULL,
      tags TEXT, -- JSON array as string
      image_url TEXT,
      gallery TEXT, -- JSON array as string
      demo_url TEXT,
      github_url TEXT,
      status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'in-progress', 'planned')),
      featured BOOLEAN DEFAULT FALSE,
      technologies TEXT, -- JSON array as string
      client_name TEXT,
      project_duration TEXT,
      completion_date DATE,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Page views table for analytics
  await runQuery(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_path TEXT NOT NULL,
      visitor_id INTEGER,
      session_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      country TEXT,
      city TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visitor_id) REFERENCES visitors(id)
    )
  `);

  // Admin users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      last_login DATETIME,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Email templates table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      variables TEXT, -- JSON array as string
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Site settings table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      setting_type TEXT DEFAULT 'string' CHECK(setting_type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await runQuery('CREATE INDEX IF NOT EXISTS idx_visitors_ip ON visitors(ip_address)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_feedback_approved ON feedback(approved)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path)');
  await runQuery('CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at)');

  console.log('✅ Tables created successfully');
}

async function createDefaultAdmin() {
  console.log('👤 Creating default admin user...');

  // Check if admin already exists
  const existingAdmin = await getQuery('SELECT id FROM admins WHERE username = ?', ['admin']);
  
  if (existingAdmin) {
    console.log('⚠️  Admin user already exists, skipping...');
    return;
  }

  // Hash default password
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  await runQuery(`
    INSERT INTO admins (username, email, password, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `, [
    'admin',
    process.env.ADMIN_EMAIL || 'admin@portfolio.com',
    hashedPassword,
    'Portfolio Admin',
    'admin'
  ]);

  console.log('✅ Default admin user created');
  console.log('📝 Username: admin');
  console.log('📝 Password:', defaultPassword);
  console.log('⚠️  Please change the default password after first login!');
}

async function insertSampleData() {
  console.log('📊 Inserting sample data...');

  // Insert sample projects
  const sampleProjects = [
    {
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      category: 'web',
      tags: '["React", "Node.js", "MongoDB", "Stripe"]',
      technologies: '["React", "Express.js", "MongoDB", "Stripe API", "JWT"]',
      status: 'completed',
      featured: true
    },
    {
      title: 'Mobile Task Manager',
      description: 'Cross-platform mobile app for task management',
      category: 'mobile',
      tags: '["React Native", "Firebase", "Redux"]',
      technologies: '["React Native", "Firebase", "Redux", "AsyncStorage"]',
      status: 'completed',
      featured: true
    },
    {
      title: 'Data Visualization Dashboard',
      description: 'Interactive dashboard for business analytics',
      category: 'web',
      tags: '["Vue.js", "D3.js", "Python", "Flask"]',
      technologies: '["Vue.js", "D3.js", "Python", "Flask", "PostgreSQL"]',
      status: 'completed',
      featured: false
    }
  ];

  for (const project of sampleProjects) {
    await runQuery(`
      INSERT INTO projects (title, description, category, tags, technologies, status, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      project.title,
      project.description,
      project.category,
      project.tags,
      project.technologies,
      project.status,
      project.featured
    ]);
  }

  // Insert sample email templates
  const emailTemplates = [
    {
      name: 'contact_confirmation',
      subject: 'Thank you for contacting us!',
      body: `
        <h2>Thank you for your message!</h2>
        <p>Hi {{name}},</p>
        <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <blockquote>{{message}}</blockquote>
        <p>Best regards,<br>Portfolio Team</p>
      `,
      variables: '["name", "message"]'
    },
    {
      name: 'contact_notification',
      subject: 'New Contact Form Submission',
      body: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {{name}}</p>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Subject:</strong> {{subject}}</p>
        <p><strong>Message:</strong></p>
        <blockquote>{{message}}</blockquote>
        <p><strong>Submitted at:</strong> {{date}}</p>
      `,
      variables: '["name", "email", "subject", "message", "date"]'
    }
  ];

  for (const template of emailTemplates) {
    await runQuery(`
      INSERT INTO email_templates (name, subject, body, variables)
      VALUES (?, ?, ?, ?)
    `, [template.name, template.subject, template.body, template.variables]);
  }

  // Insert default site settings
  const siteSettings = [
    { key: 'site_name', value: 'My Portfolio', type: 'string', description: 'Website name' },
    { key: 'site_description', value: 'Professional portfolio website', type: 'string', description: 'Website description' },
    { key: 'contact_email', value: 'contact@portfolio.com', type: 'string', description: 'Contact email address' },
    { key: 'enable_visitor_tracking', value: 'true', type: 'boolean', description: 'Enable visitor tracking' },
    { key: 'enable_email_notifications', value: 'true', type: 'boolean', description: 'Enable email notifications' },
    { key: 'max_file_upload_size', value: '5242880', type: 'number', description: 'Max file upload size in bytes (5MB)' }
  ];

  for (const setting of siteSettings) {
    await runQuery(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
      VALUES (?, ?, ?, ?)
    `, [setting.key, setting.value, setting.type, setting.description]);
  }

  console.log('✅ Sample data inserted successfully');
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };