#!/usr/bin/env node

/**
 * Migration script to safely add unique constraint to phone field
 * Handles existing duplicate phone numbers in production
 */

// Try different Prisma client paths
let PrismaClient;
try {
  PrismaClient = require('../src/generated/prisma').PrismaClient;
} catch (e) {
  try {
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch (e2) {
    console.error('Could not load Prisma client');
    process.exit(1);
  }
}

async function migratePhoneUnique() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Starting phone number migration...');
    
    // Find users with duplicate or null phone numbers
    const usersWithDuplicatePhones = await prisma.$queryRaw`
      SELECT phone, COUNT(*) as count 
      FROM users 
      WHERE phone IS NOT NULL 
      GROUP BY phone 
      HAVING COUNT(*) > 1
    `;
    
    console.log(`Found ${usersWithDuplicatePhones.length} phone numbers with duplicates`);
    
    // Find users with null phone numbers
    const usersWithNullPhones = await prisma.user.findMany({
      where: { phone: null },
      select: { id: true }
    });
    
    console.log(`Found ${usersWithNullPhones.length} users with null phone numbers`);
    
    // Clear phone numbers for users with duplicates (except the first one)
    for (const duplicate of usersWithDuplicatePhones) {
      const usersWithPhone = await prisma.user.findMany({
        where: { phone: duplicate.phone },
        orderBy: { createdAt: 'asc' }
      });
      
      // Keep the first user's phone, clear the rest
      for (let i = 1; i < usersWithPhone.length; i++) {
        await prisma.user.update({
          where: { id: usersWithPhone[i].id },
          data: { phone: null }
        });
        console.log(`Cleared duplicate phone for user ${usersWithPhone[i].id}`);
      }
    }
    
    console.log('✅ Phone number migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migratePhoneUnique()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migratePhoneUnique };