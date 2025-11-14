const { PrismaClient } = require('@prisma/client');

// Create Prisma client
const prisma = new PrismaClient();

const users = [
  {
    username: 'literarycritic',
    displayName: 'Dr. Sarah Chen',
    bio: 'Professor of Russian Literature at Stanford. Dostoevsky enthusiast.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=literarycritic'
  },
  {
    username: 'booklover',
    displayName: 'Alex Rivera',
    bio: 'Reading 100 books this year. Currently at 47. Follow my journey!',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=booklover'
  },
  {
    username: 'scifigeek',
    displayName: 'Jordan Kim',
    bio: 'Science fiction enthusiast. Dune is overrated, fight me.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=scifigeek'
  },
  {
    username: 'classicreader',
    displayName: 'Emma Thompson',
    bio: 'Only reading books published before 1950. Living in the past.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=classicreader'
  },
  {
    username: 'poetrycorner',
    displayName: 'Marcus Lee',
    bio: 'Poetry and prose. Believer in the power of words.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=poetrycorner'
  },
  {
    username: 'mysteryfan',
    displayName: 'Rachel Adams',
    bio: 'True crime and mystery novels. Always trying to solve it before the detective.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mysteryfan'
  },
  {
    username: 'philosophyreads',
    displayName: 'David Patel',
    bio: 'Exploring existentialism, stoicism, and everything in between.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=philosophyreads'
  },
  {
    username: 'fantasylover',
    displayName: 'Luna Martinez',
    bio: 'Dragons, magic, and epic quests. Tolkien forever.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fantasylover'
  }
];

async function main() {
  console.log('Starting fresh database setup...');

  // Create users
  for (const userData of users) {
    try {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`✓ Created user: ${user.username} (${user.displayName})`);
    } catch (error) {
      console.log(`- User ${userData.username} already exists`);
    }
  }

  console.log('\n✓ Database setup complete!');
  console.log('✓ 8 mock users created');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
