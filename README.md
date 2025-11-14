# Reader Noter App

A social reading annotation platform that allows readers to share and discover annotations on books, articles, and other reading materials.

## Overview

Reader Noter is a unique social reading platform that combines:
- **Social Graph Model**: Follow readers you admire and see their annotations
- **Multi-Format Support**: PDFs, EPUBs, and web articles
- **Intelligent Text Matching**: Comments anchor to text positions across different editions
- **Social Media Integration**: Import annotations from Twitter/X (Phase 3+)

## Differentiation

Unlike traditional annotation tools (e.g., Hypothesis), Reader Noter is:
- **People-focused**: Follow specific readers, not documents
- **Consumer-oriented**: Built for novels, popular non-fiction, and general reading
- **Social-first**: Integrates with social media platforms
- **Influencer-ready**: Enables "reading influencers" and expert commentary

## Project Structure

```
reader-noter-app/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/             # React + TypeScript + Tailwind
│   ├── src/
│   └── package.json
├── claude.md             # Project instructions for Claude
├── prompts.md            # Conversation history
└── system-architecture.md # Technical architecture
```

## Tech Stack

### Backend
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL 15+
- Prisma ORM

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- React Router v6
- Axios

## Getting Started

### Prerequisites

- Node.js 18+ (18.16.1 or higher)
- PostgreSQL 15+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd reader-noter-app
```

2. **Set up the backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend will run on `http://localhost:5000`

3. **Set up the frontend** (in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Frontend will run on `http://localhost:3000`

## Development Phases

### Phase 1: MVP (Current)
- [x] Project setup and architecture
- [x] Mock authentication system
- [ ] PDF upload and text extraction
- [ ] Basic commenting functionality
- [ ] User subscriptions (follow/unfollow)
- [ ] Comment feed from followed users
- [ ] Basic reader UI (20/80 split layout)

### Phase 2: Enhanced Features
- [ ] Fuzzy text matching algorithm
- [ ] EPUB support
- [ ] Web article support
- [ ] Improved UI/UX
- [ ] Comment positioning optimization

### Phase 3: Social Integration
- [ ] OAuth authentication (Twitter/X)
- [ ] Replace mock auth with real social login
- [ ] Social media comment import
- [ ] Automated parsing pipeline
- [ ] Notification system

### Phase 4: Scale & Polish
- [ ] Performance optimization
- [ ] Mobile responsive design
- [ ] Comment threads and replies
- [ ] Analytics dashboard
- [ ] Monetization features

## Key Features

### Mock Authentication (MVP)
For rapid development, the MVP uses a simple user selection system:
- Pre-seeded mock users (no passwords)
- User ID stored in localStorage
- Easy switching between user personas
- Will be replaced with OAuth in Phase 3

### Text Matching Algorithm
Multi-layer approach for matching comments across different editions:
1. **Exact Fingerprint**: SHA-256 hash matching (fastest)
2. **Fuzzy Matching**: PostgreSQL pg_trgm for similar text
3. **Approximate Position**: Chapter/page-based fallback

### Copyright Compliance
The app follows an **annotation infrastructure** model:
- Does NOT store copyrighted content
- Users provide their own legal copies
- Only stores: position data, text fingerprints, and user comments
- Small text snippets (<100 chars) for matching (fair use)

## Database Schema

Key tables:
- `users` - User accounts with optional OAuth fields
- `texts` - Books, articles, documents metadata
- `comments` - User annotations with position anchoring
- `subscriptions` - User follow relationships
- `user_documents` - User-uploaded files
- `social_media_comments` - Imported social posts (Phase 3+)

See `backend/prisma/schema.prisma` for complete schema.

## API Documentation

### Mock Authentication
```
GET  /api/auth/mock-users       # List available mock users
POST /api/auth/mock-login       # Login as a mock user
GET  /api/auth/me               # Get current user
POST /api/auth/logout           # Logout
```

More endpoints will be documented as features are implemented.

## Mock Users (Seeded)

After running `npm run prisma:seed`, the following users are available:
- `literarycritic` - Dr. Sarah Chen (Literature Professor)
- `booklover` - Alex Rivera (Avid Reader)
- `scifigeek` - Jordan Kim (Sci-Fi Enthusiast)
- `classicreader` - Emma Thompson (Classic Literature Fan)
- `poetrycorner` - Marcus Lee (Poetry Lover)
- `mysteryfan` - Rachel Adams (Mystery Reader)
- `philosophyreads` - David Patel (Philosophy Reader)
- `fantasylover` - Luna Martinez (Fantasy Fan)

## Documentation

- `CLAUDE.md` - Project concept and initial requirements
- `prompts.md` - Conversation history and decision log
- `system-architecture.md` - Detailed technical architecture
- `backend/README.md` - Backend setup and API docs
- `frontend/README.md` - Frontend development guide

## Contributing

This is a personal project currently in MVP development. Contributions will be welcome in the future.

## License

ISC

## Roadmap & Vision

**Short-term (3-6 months)**
- Complete MVP with core annotation features
- PDF support with text extraction
- Basic social features (follow users, view their comments)

**Medium-term (6-12 months)**
- Multi-format support (EPUB, web)
- OAuth integration
- Social media comment import
- Mobile-responsive UI

**Long-term (12+ months)**
- Expert commentary marketplace
- Premium subscriptions to "reading influencers"
- Advanced text matching across editions
- Community features (book clubs, discussions)

---

Built with ❤️ for readers who want to share their insights and learn from others.
