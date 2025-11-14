import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create mock users
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

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData
    });
    console.log(`Created user: ${user.username} (${user.displayName})`);
  }

  // Create some sample texts
  const texts = [
    {
      title: 'Crime and Punishment',
      author: 'Fyodor Dostoevsky',
      isbn: '9780143107637',
      type: 'book',
      edition: 'Penguin Classics'
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273565',
      type: 'book',
      edition: 'Scribner'
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      type: 'book',
      edition: 'Signet Classic'
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441172719',
      type: 'book',
      edition: 'Ace'
    }
  ];

  for (const textData of texts) {
    // Check if text already exists by ISBN
    const existing = await prisma.text.findFirst({
      where: { isbn: textData.isbn }
    });

    if (!existing) {
      const text = await prisma.text.create({
        data: textData
      });
      console.log(`Created text: ${text.title} by ${text.author}`);
    } else {
      console.log(`Text already exists: ${existing.title}`);
    }
  }

  // Create some sample subscriptions (users following each other)
  const literaryCritic = await prisma.user.findUnique({ where: { username: 'literarycritic' } });
  const bookLover = await prisma.user.findUnique({ where: { username: 'booklover' } });
  const scifiGeek = await prisma.user.findUnique({ where: { username: 'scifigeek' } });
  const classicReader = await prisma.user.findUnique({ where: { username: 'classicreader' } });

  if (literaryCritic && bookLover && scifiGeek && classicReader) {
    // booklover follows literarycritic and classicreader
    await prisma.subscription.upsert({
      where: {
        followerId_followingId: {
          followerId: bookLover.id,
          followingId: literaryCritic.id
        }
      },
      update: {},
      create: {
        followerId: bookLover.id,
        followingId: literaryCritic.id
      }
    });

    await prisma.subscription.upsert({
      where: {
        followerId_followingId: {
          followerId: bookLover.id,
          followingId: classicReader.id
        }
      },
      update: {},
      create: {
        followerId: bookLover.id,
        followingId: classicReader.id
      }
    });

    // scifigeek follows literarycritic
    await prisma.subscription.upsert({
      where: {
        followerId_followingId: {
          followerId: scifiGeek.id,
          followingId: literaryCritic.id
        }
      },
      update: {},
      create: {
        followerId: scifiGeek.id,
        followingId: literaryCritic.id
      }
    });

    console.log('Created sample subscriptions');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
