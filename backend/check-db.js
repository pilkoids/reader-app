const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Testing database connection...');
    const users = await prisma.user.findMany();
    console.log(`✓ Database connection successful!`);
    console.log(`✓ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.displayName})`);
    });
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase();
