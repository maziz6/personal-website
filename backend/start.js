// server/scripts/start.js - Application startup script (2025-ready)

require('dotenv-expand').expand(require('dotenv').config());

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

let logger;
try {
  logger = require('../utils/logger');
} catch (err) {
  logger = console;
}

async function startApplication() {
  try {
    console.log(chalk.cyanBright('\n🚀 Launching Portfolio Application...'));

    // Step 1: Initialize database
    console.log(chalk.yellow('📁 Step 1: Initializing database...'));
    const { initializeDatabase } = require('./initDb');
    await initializeDatabase();

    // Step 2: Validate environment
    console.log(chalk.yellow('🔧 Step 2: Validating environment...'));
    checkEnvironment();

    // Step 3: Start the server
    console.log(chalk.yellow('🌐 Step 3: Booting up web server...'));
    require('../server');

  } catch (error) {
    logger.error(chalk.redBright('❌ Startup failed:'), error);
    process.exit(1);
  }
}

function checkEnvironment() {
  const requiredEnv = ['NODE_ENV', 'PORT', 'JWT_SECRET'];
  const optionalEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

  const missing = [];

  console.log(chalk.blueBright('\n📋 Required Environment Variables:'));
  for (const key of requiredEnv) {
    const val = process.env[key];
    if (!val) {
      console.log(`   ❌ ${key} ${chalk.red('NOT SET')}`);
      missing.push(key);
    } else {
      const display = key.includes('SECRET') ? '[HIDDEN]' : val;
      console.log(`   ✅ ${key}: ${chalk.green(display)}`);
    }
  }

  if (missing.length) {
    console.error(chalk.redBright(`\n⛔ Missing required variables: ${missing.join(', ')}`));
    console.log(chalk.yellow('💡 Tip: Double-check your .env file or CI environment.'));
    process.exit(1);
  }

  console.log(chalk.magentaBright('\n📋 Optional Environment Variables:'));
  for (const key of optionalEnv) {
    const val = process.env[key];
    const display = key.includes('PASS') || key.includes('SECRET') ? '[HIDDEN]' : val || 'Default/Empty';
    const status = val ? chalk.green('✅') : chalk.gray('⚠️');
    console.log(`   ${status} ${key}: ${chalk.dim(display)}`);
  }

  console.log(chalk.greenBright('\n✅ All required environment variables are good to go!\n'));
}

// Handle unexpected errors globally
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Run only if executed directly
if (require.main === module) {
  startApplication();
}

module.exports = { startApplication };
