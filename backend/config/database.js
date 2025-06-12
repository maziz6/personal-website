
// server/config/database.js - Modern SQLite Configuration (2025-Ready)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const chalk = require('chalk');

const DB_PATH = path.resolve(__dirname, '../data/portfolio.db');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error(chalk.red('❌ Failed to connect to SQLite:'), err.message);
      } else {
        console.log(chalk.green('✅ Connected to SQLite DB @'), DB_PATH);
        this.createTables();
      }
    });
  }

  createTables() {
    const schema = [
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        category TEXT NOT NULL,
        feedback TEXT NOT NULL,
        is_public BOOLEAN DEFAULT 0,
        is_approved BOOLEAN DEFAULT 0,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        page TEXT NOT NULL,
        referrer TEXT,
        country TEXT,
        city TEXT,
        device_type TEXT,
        browser TEXT,
        os TEXT,
        visit_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        image_url TEXT,
        demo_url TEXT,
        github_url TEXT,
        technologies TEXT,
        category TEXT NOT NULL,
        status TEXT DEFAULT 'completed',
        featured BOOLEAN DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS site_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stat_name TEXT UNIQUE NOT NULL,
        stat_value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    schema.forEach((query, i) => {
      this.db.run(query, (err) => {
        if (err) console.error(chalk.red(`❌ Table ${i + 1} creation failed:`), err.message);
      });
    });

    this.insertInitialData();
  }

  insertInitialData() {
    const stats = [
      ['total_visitors', '0'],
      ['unique_visitors', '0'],
      ['page_views', '0'],
      ['contact_submissions', '0'],
      ['feedback_submissions', '0']
    ];

    const stmt = this.db.prepare(
      `INSERT OR IGNORE INTO site_stats (stat_name, stat_value) VALUES (?, ?)`
    );

    stats.forEach(([name, value]) => stmt.run(name, value));
    stmt.finalize();

    this.insertSampleProjects();
  }

  insertSampleProjects() {
    const projects = [
      {
        title: 'Personal Portfolio Website',
        description: 'Modern responsive portfolio built with React and Node.js.',
        short_description: 'React portfolio site',
        technologies: JSON.stringify(['React', 'Node.js', 'Express', 'SQLite', 'CSS3']),
        category: 'web',
        featured: 1,
        status: 'completed',
        sort_order: 1
      },
      {
        title: 'E-commerce Platform',
        description: 'Full-stack commerce app with Stripe, MongoDB, and JWT.',
        short_description: 'Full commerce site',
        technologies: JSON.stringify(['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT']),
        category: 'web',
        featured: 1,
        status: 'completed',
        sort_order: 2
      }
    ];

    const stmt = this.db.prepare(
      `INSERT OR IGNORE INTO projects (
        title, description, short_description, technologies,
        category, featured, status, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    projects.forEach(p => {
      stmt.run(p.title, p.description, p.short_description, p.technologies,
        p.category, p.featured, p.status, p.sort_order);
    });

    stmt.finalize();
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => err ? reject(err) : resolve());
    });
  }
}

module.exports = new Database();
