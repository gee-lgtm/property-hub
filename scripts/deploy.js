#!/usr/bin/env node

/**
 * Deployment script for PropertyHub
 * Handles environment-specific database schema deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

console.log(`🚀 Deploying PropertyHub (${isProduction ? 'Production' : 'Development'} mode)`);

// Set default DATABASE_URL for development if not set
if (!isProduction && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
  console.log('🔧 Set development DATABASE_URL');
}

// Create temporary schema file for production
if (isProduction) {
  console.log('📝 Creating production schema...');
  
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Replace SQLite with PostgreSQL for production
  const productionSchema = schemaContent.replace(
    'provider = "sqlite"',
    'provider = "postgresql"'
  );
  
  // Write temporary production schema
  const tempSchemaPath = path.join(__dirname, '../prisma/schema.prod.prisma');
  fs.writeFileSync(tempSchemaPath, productionSchema);
  
  // Use production schema
  fs.renameSync(schemaPath, path.join(__dirname, '../prisma/schema.dev.prisma'));
  fs.renameSync(tempSchemaPath, schemaPath);
}

try {
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  
  // Only push schema if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    console.log('📊 Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit', env: process.env });
  } else {
    console.log('⚠️ DATABASE_URL not found, skipping schema push');
  }
  
  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  if (!isProduction) {
    console.log('💡 For development, try: DATABASE_URL="file:./prisma/dev.db" npm run build');
  }
  process.exit(1);
} finally {
  // Restore development schema if we're in production
  if (isProduction) {
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
    const devSchemaPath = path.join(__dirname, '../prisma/schema.dev.prisma');
    
    if (fs.existsSync(devSchemaPath)) {
      fs.renameSync(schemaPath, path.join(__dirname, '../prisma/schema.temp.prisma'));
      fs.renameSync(devSchemaPath, schemaPath);
      fs.unlinkSync(path.join(__dirname, '../prisma/schema.temp.prisma'));
    }
  }
}