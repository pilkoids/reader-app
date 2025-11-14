# Reader Noter Backend

Backend API for the Reader Noter application - a social reading annotation platform.

## Tech Stack

- Node.js 18+
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18.18 or higher
- PostgreSQL 15+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/reader_noter?schema=public"
```

3. Initialize the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with mock users
npm run prisma:seed
```

### Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with mock data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed file
├── src/
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── index.ts           # App entry point
├── .env.example           # Environment variables template
├── package.json
└── tsconfig.json          # TypeScript configuration
```

## Mock Authentication (MVP)

This MVP uses a simple mock authentication system:

- Pre-seeded users are available in the database
- Clients send `x-mock-user-id` header with requests
- No passwords or OAuth required
- Will be replaced with Twitter/X OAuth in Phase 3

### Mock Users

After seeding, the following users are available:
- `literarycritic` - Dr. Sarah Chen (Literature Professor)
- `booklover` - Alex Rivera (Avid Reader)
- `scifigeek` - Jordan Kim (Sci-Fi Enthusiast)
- `classicreader` - Emma Thompson (Classic Literature Fan)
- `poetrycorner` - Marcus Lee (Poetry Lover)
- `mysteryfan` - Rachel Adams (Mystery Reader)
- `philosophyreads` - David Patel (Philosophy Reader)
- `fantasylover` - Luna Martinez (Fantasy Fan)

## API Documentation

### Health Check
```
GET /health
```

### Authentication (Mock)
```
GET  /api/auth/mock-users    # List available mock users
POST /api/auth/mock-login    # Login as a mock user
GET  /api/auth/me            # Get current user
```

More endpoints will be added as features are implemented.

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

Key tables:
- `users` - User accounts
- `texts` - Books, articles, documents
- `comments` - User annotations
- `subscriptions` - User follow relationships
- `user_documents` - User-uploaded files
- `social_media_comments` - Imported social media posts (Phase 3+)

## Development Roadmap

### Phase 1 (Current - MVP)
- Mock authentication
- PDF upload and text extraction
- Basic commenting
- User subscriptions
- Simple text matching

### Phase 2
- Fuzzy text matching
- EPUB and web article support
- Improved UI/UX

### Phase 3
- OAuth authentication (Twitter/X)
- Social media comment import
- Advanced features

## License

ISC
