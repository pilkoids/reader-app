# System Architecture - Reader Noter App

## Tech Stack Overview

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Components**: shadcn/ui or Material-UI
- **PDF Rendering**: react-pdf or PDF.js
- **EPUB Rendering**: epub.js
- **Text Selection**: Custom implementation with Range API
- **Routing**: React Router v6
- **HTTP Client**: Axios or React Query
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js with TypeScript
- **ORM**: Prisma (type-safe, great DX)
- **Authentication**: Mock auth for MVP (simple user selection), OAuth (Twitter/X, etc.) in Phase 2+
- **Validation**: Zod
- **API Documentation**: OpenAPI/Swagger
- **File Processing**:
  - PDF: pdf-parse or pdf.js
  - EPUB: epub-parser
  - Web: cheerio or readability

### Database
- **Primary DB**: **PostgreSQL 15+**
  - Excellent relational data handling
  - Built-in full-text search (for text matching)
  - JSONB support for flexible metadata
  - Strong TypeScript ORM support
  - Reliable for user data, subscriptions, comments
  - pg_trgm extension for fuzzy text matching

- **Caching Layer**: Redis
  - Session storage
  - Frequently accessed text fingerprints
  - Rate limiting for social media APIs

### Infrastructure
- **Hosting**: Vercel/Netlify (Frontend) + Railway/Render (Backend)
- **File Storage**: AWS S3 or Cloudflare R2 (user-uploaded PDFs)
- **CDN**: Cloudflare
- **Monitoring**: Sentry (error tracking)

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx          # Main 20/80 split layout
│   │   ├── Sidebar.tsx                  # Left pane (20%)
│   │   └── ReaderPane.tsx               # Right pane (80%)
│   ├── reader/
│   │   ├── PDFReader.tsx                # PDF rendering
│   │   ├── EPUBReader.tsx               # EPUB rendering
│   │   ├── WebArticleReader.tsx         # Web article display
│   │   ├── TextSelectionHandler.tsx     # Highlight/annotation logic
│   │   ├── CommentMarker.tsx            # Avatar markers in margins
│   │   └── CommentModal.tsx             # Popup for viewing comments
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   ├── CommentCreate.tsx
│   │   └── CommentThread.tsx
│   ├── social/
│   │   ├── FollowingList.tsx
│   │   └── SocialImportStatus.tsx
│   └── auth/
│       ├── Login.tsx
│       └── Register.tsx
├── hooks/
│   ├── useTextSelection.ts              # Handle text highlighting
│   ├── useComments.ts                   # Fetch/create comments
│   ├── useTextMatching.ts               # Match comments to positions
│   └── useReader.ts                     # Reader state management
├── services/
│   ├── api.ts                           # Axios instance
│   ├── commentService.ts
│   ├── textService.ts
│   └── authService.ts
├── store/
│   ├── authSlice.ts
│   ├── readerSlice.ts
│   └── commentSlice.ts
├── types/
│   ├── index.ts
│   ├── comment.ts
│   ├── text.ts
│   └── user.ts
└── utils/
    ├── textFingerprint.ts               # Generate text hashes
    ├── positionCalculator.ts            # Calculate comment positions
    └── formatConverter.ts               # Handle different file formats
```

### Key Frontend Features

#### 1. Text Selection & Annotation
```typescript
// Capture user selection and create annotation anchor
interface TextAnchor {
  startOffset: number;
  endOffset: number;
  selectedText: string;
  contextBefore: string;  // 50 chars before
  contextAfter: string;   // 50 chars after
  fingerprint: string;    // Hash for matching
}
```

#### 2. Comment Positioning
```typescript
// Calculate where to display comment markers
interface CommentPosition {
  commentId: string;
  yPosition: number;      // Vertical position in pixels
  avatarUrl: string;
  author: User;
}
```

#### 3. Reader State Management
```typescript
interface ReaderState {
  currentDocument: Document | null;
  extractedText: string;  // Temporary, not persisted
  currentPage: number;
  comments: Comment[];
  showComments: boolean;
  activeComment: Comment | null;
}
```

---

## Backend Architecture

### API Structure

```
src/
├── controllers/
│   ├── authController.ts
│   ├── textController.ts
│   ├── commentController.ts
│   ├── subscriptionController.ts
│   └── socialMediaController.ts
├── services/
│   ├── textProcessingService.ts         # Extract text from files
│   ├── textMatchingService.ts           # Match comments to positions
│   ├── fingerprintService.ts            # Generate text fingerprints
│   ├── socialMediaParser.ts             # Parse social media posts
│   └── notificationService.ts
├── middleware/
│   ├── auth.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
├── routes/
│   ├── auth.ts
│   ├── texts.ts
│   ├── comments.ts
│   ├── subscriptions.ts
│   └── socialMedia.ts
├── models/                              # Prisma schema location
│   └── schema.prisma
├── utils/
│   ├── crypto.ts                        # Hashing utilities
│   ├── fileParser.ts
│   └── validators.ts
└── types/
    └── index.ts
```

### Core Services

#### 1. Text Processing Service
```typescript
class TextProcessingService {
  extractTextFromPDF(file: Buffer): Promise<string>
  extractTextFromEPUB(file: Buffer): Promise<string>
  extractTextFromURL(url: string): Promise<string>
  normalizeText(text: string): string  // Remove formatting inconsistencies
}
```

#### 2. Text Matching Service
```typescript
class TextMatchingService {
  // Find comment position in user's document
  matchCommentToPosition(
    comment: Comment,
    documentText: string
  ): TextPosition | null

  // Use fuzzy matching for different editions
  fuzzyMatch(
    fingerprint: string,
    targetText: string,
    threshold: number
  ): Match[]
}
```

#### 3. Fingerprint Service
```typescript
class FingerprintService {
  // Create unique identifier for text snippet
  generateFingerprint(text: string, context: string): string

  // Create multiple fingerprints for robustness
  generateMultipleAnchors(selection: TextSelection): Anchor[]
}
```

#### 4. Social Media Parser
```typescript
class SocialMediaParser {
  parseTwitterPost(post: TwitterPost): ParsedComment | null
  extractBookReference(text: string): BookReference
  extractLocation(text: string): LocationData
  validateFormat(post: SocialPost): boolean
}
```

---

## Database Schema (PostgreSQL)

### Core Tables

```sql
-- Users (simplified for mock auth MVP)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  bio TEXT,

  -- For future OAuth integration
  email VARCHAR(255),
  social_provider VARCHAR(50), -- 'twitter', 'facebook', null for mock users
  social_user_id VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Texts (books, articles, etc.)
CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(13),
  type VARCHAR(50), -- 'pdf', 'epub', 'web', 'other'
  edition VARCHAR(100),
  url TEXT, -- For web articles
  metadata JSONB, -- Flexible storage for any additional data
  created_at TIMESTAMP DEFAULT NOW(),

  -- Full-text search index
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || COALESCE(author, ''))) STORED
);

CREATE INDEX texts_search_idx ON texts USING GIN(tsv);

-- User-uploaded documents (private copies)
CREATE TABLE user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text_id UUID REFERENCES texts(id) ON DELETE CASCADE,
  file_url VARCHAR(500), -- S3 URL for uploaded PDF/EPUB
  upload_date TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,

  UNIQUE(user_id, text_id)
);

-- Comments/Annotations
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text_id UUID REFERENCES texts(id) ON DELETE CASCADE,

  -- Position data
  chapter VARCHAR(255),
  page_number INTEGER,
  paragraph_number INTEGER,
  character_offset INTEGER,

  -- Text anchoring (for matching across editions)
  selected_text VARCHAR(500), -- The highlighted snippet
  context_before VARCHAR(200),
  context_after VARCHAR(200),
  fingerprint VARCHAR(64), -- SHA-256 hash

  -- Comment content
  comment_text TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- For fuzzy matching
  tsv_anchor tsvector GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(selected_text, '') || ' ' || COALESCE(context_before, '') || ' ' || COALESCE(context_after, ''))
  ) STORED
);

CREATE INDEX comments_text_id_idx ON comments(text_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_fingerprint_idx ON comments(fingerprint);
CREATE INDEX comments_anchor_search_idx ON comments USING GIN(tsv_anchor);

-- Subscriptions (following other users)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX subscriptions_follower_idx ON subscriptions(follower_id);
CREATE INDEX subscriptions_following_idx ON subscriptions(following_id);

-- Social Media Comments (imported from X, Facebook, etc.)
CREATE TABLE social_media_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_media_platform VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', etc.
  social_media_user_id VARCHAR(255) NOT NULL,
  social_media_post_id VARCHAR(255) UNIQUE NOT NULL,

  reader_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Matched internal user

  -- Raw data
  raw_comment_text TEXT NOT NULL,
  post_url TEXT,

  -- Parsed data
  parsed_title VARCHAR(500),
  parsed_chapter VARCHAR(255),
  parsed_page INTEGER,
  parsed_paragraph INTEGER,
  parsed_quote TEXT,
  parsed_comment TEXT,

  -- Processing status
  is_parsed BOOLEAN DEFAULT false,
  parsing_error TEXT,

  -- Link to created comment
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,

  timestamp TIMESTAMP NOT NULL,
  imported_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX social_media_platform_idx ON social_media_comments(social_media_platform);
CREATE INDEX social_media_reader_idx ON social_media_comments(reader_id);
CREATE INDEX social_media_timestamp_idx ON social_media_comments(timestamp DESC);

-- Comment Likes (optional future feature)
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(comment_id, user_id)
);

-- Notifications (optional future feature)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'new_comment', 'new_follower', 'comment_like'
  related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX notifications_user_idx ON notifications(user_id, is_read);
```

### Prisma Schema (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  username     String   @unique @db.VarChar(50)
  displayName  String?  @map("display_name") @db.VarChar(100)
  avatarUrl    String?  @map("avatar_url") @db.VarChar(500)
  bio          String?  @db.Text

  // For future OAuth integration
  email           String? @db.VarChar(255)
  socialProvider  String? @map("social_provider") @db.VarChar(50)
  socialUserId    String? @map("social_user_id") @db.VarChar(255)

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  comments             Comment[]
  userDocuments        UserDocument[]
  followers            Subscription[] @relation("Following")
  following            Subscription[] @relation("Follower")
  socialMediaComments  SocialMediaComment[]

  @@map("users")
}

model Text {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String   @db.VarChar(500)
  author    String?  @db.VarChar(255)
  isbn      String?  @db.VarChar(13)
  type      String?  @db.VarChar(50)
  edition   String?  @db.VarChar(100)
  url       String?  @db.Text
  metadata  Json?    @db.JsonB
  createdAt DateTime @default(now()) @map("created_at")

  comments      Comment[]
  userDocuments UserDocument[]

  @@map("texts")
}

model UserDocument {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String    @map("user_id") @db.Uuid
  textId       String    @map("text_id") @db.Uuid
  fileUrl      String?   @map("file_url") @db.VarChar(500)
  uploadDate   DateTime  @default(now()) @map("upload_date")
  lastAccessed DateTime? @map("last_accessed")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  text Text @relation(fields: [textId], references: [id], onDelete: Cascade)

  @@unique([userId, textId])
  @@map("user_documents")
}

model Comment {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  textId          String   @map("text_id") @db.Uuid

  // Position data
  chapter         String?  @db.VarChar(255)
  pageNumber      Int?     @map("page_number")
  paragraphNumber Int?     @map("paragraph_number")
  characterOffset Int?     @map("character_offset")

  // Text anchoring
  selectedText    String?  @map("selected_text") @db.VarChar(500)
  contextBefore   String?  @map("context_before") @db.VarChar(200)
  contextAfter    String?  @map("context_after") @db.VarChar(200)
  fingerprint     String?  @db.VarChar(64)

  // Content
  commentText     String   @map("comment_text") @db.Text
  isPublic        Boolean  @default(true) @map("is_public")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user                User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  text                Text                  @relation(fields: [textId], references: [id], onDelete: Cascade)
  socialMediaComments SocialMediaComment[]

  @@index([textId])
  @@index([userId])
  @@index([fingerprint])
  @@map("comments")
}

model Subscription {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  followerId  String   @map("follower_id") @db.Uuid
  followingId String   @map("following_id") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("subscriptions")
}

model SocialMediaComment {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  socialMediaPlatform  String    @map("social_media_platform") @db.VarChar(50)
  socialMediaUserId    String    @map("social_media_user_id") @db.VarChar(255)
  socialMediaPostId    String    @unique @map("social_media_post_id") @db.VarChar(255)

  readerId             String?   @map("reader_id") @db.Uuid

  // Raw data
  rawCommentText       String    @map("raw_comment_text") @db.Text
  postUrl              String?   @map("post_url") @db.Text

  // Parsed data
  parsedTitle          String?   @map("parsed_title") @db.VarChar(500)
  parsedChapter        String?   @map("parsed_chapter") @db.VarChar(255)
  parsedPage           Int?      @map("parsed_page")
  parsedParagraph      Int?      @map("parsed_paragraph")
  parsedQuote          String?   @map("parsed_quote") @db.Text
  parsedComment        String?   @map("parsed_comment") @db.Text

  // Processing
  isParsed             Boolean   @default(false) @map("is_parsed")
  parsingError         String?   @map("parsing_error") @db.Text

  commentId            String?   @map("comment_id") @db.Uuid

  timestamp            DateTime
  importedAt           DateTime  @default(now()) @map("imported_at")

  reader  User?    @relation(fields: [readerId], references: [id], onDelete: Cascade)
  comment Comment? @relation(fields: [commentId], references: [id], onDelete: SetNull)

  @@index([socialMediaPlatform])
  @@index([readerId])
  @@index([timestamp(sort: Desc)])
  @@map("social_media_comments")
}
```

---

## API Endpoints

### Authentication (Mock for MVP)
```
GET    /api/auth/mock-users              # List available mock users
POST   /api/auth/mock-login               # Select a mock user (no password)
POST   /api/auth/logout                   # Clear session
GET    /api/auth/me                       # Get current user

# Future OAuth endpoints (Phase 2+)
# GET    /api/auth/twitter                # Redirect to Twitter OAuth
# GET    /api/auth/twitter/callback       # OAuth callback
# POST   /api/auth/link-account           # Link social account
```

### Texts
```
GET    /api/texts                    # Search/list texts
GET    /api/texts/:id                # Get text metadata
POST   /api/texts                    # Create text entry
POST   /api/texts/upload             # Upload PDF/EPUB (returns temp text)
POST   /api/texts/from-url           # Extract from web URL
```

### Comments
```
GET    /api/comments?textId=...             # Get comments for a text
GET    /api/comments/feed                    # Get comments from followed users
POST   /api/comments                         # Create comment
PUT    /api/comments/:id                     # Update comment
DELETE /api/comments/:id                     # Delete comment
POST   /api/comments/match                   # Match comments to user's document
```

### Subscriptions
```
GET    /api/subscriptions/following          # Users I follow
GET    /api/subscriptions/followers          # My followers
POST   /api/subscriptions                    # Follow user
DELETE /api/subscriptions/:userId            # Unfollow user
```

### Social Media
```
GET    /api/social-media/pending             # Unparsed social posts
POST   /api/social-media/import              # Manual import from URL
POST   /api/social-media/link-account        # Link social media account
GET    /api/social-media/status              # Import status
```

---

## Text Matching Algorithm

### Approach: Multi-Layer Matching

```typescript
interface MatchingStrategy {
  // Layer 1: Exact fingerprint match (fastest)
  exactMatch(fingerprint: string, text: string): Position | null;

  // Layer 2: Fuzzy text search with context
  fuzzyMatch(selectedText: string, context: string, text: string): Position[];

  // Layer 3: Position-based approximation
  approximatePosition(chapter: string, page: number, text: string): Position | null;
}

// Implementation
class TextMatcher {
  async matchComment(comment: Comment, documentText: string): Promise<Position | null> {
    // Try exact fingerprint first
    let match = this.exactMatch(comment.fingerprint, documentText);
    if (match) return match;

    // Try fuzzy matching with trigrams
    const fuzzyMatches = this.fuzzyMatch(
      comment.selectedText,
      comment.contextBefore + comment.contextAfter,
      documentText
    );

    if (fuzzyMatches.length > 0) {
      return this.selectBestMatch(fuzzyMatches);
    }

    // Fall back to approximate position
    return this.approximatePosition(
      comment.chapter,
      comment.pageNumber,
      documentText
    );
  }

  private exactMatch(fingerprint: string, text: string): Position | null {
    // Use sliding window to check all possible snippets
    // Return position if hash matches
  }

  private fuzzyMatch(target: string, context: string, text: string): Position[] {
    // Use PostgreSQL pg_trgm or JavaScript fuzzy library
    // Return positions with similarity score > threshold (e.g., 0.8)
  }
}
```

---

## Security Considerations

### 1. File Upload Security
- Validate file types (PDF, EPUB only)
- Scan for malware
- Size limits (e.g., 50MB max)
- Store in isolated S3 bucket with presigned URLs

### 2. Authentication (Mock for MVP)
- Simple session-based auth (localStorage or cookie)
- No password validation required
- Pre-seeded mock users in database
- HTTPS only in production
- Future: OAuth with Twitter/X (Phase 2+)
  - JWT with short expiration
  - Secure OAuth flow
  - No password storage

### 3. Data Privacy
- Users can only access their own uploaded files
- Comments default to public but can be private
- GDPR compliance (data export, deletion)

### 4. Social Media Integration
- Never store social media passwords
- Use OAuth for account linking
- Rate limit API calls
- Validate webhook signatures

---

## Deployment Architecture

```
┌─────────────┐
│   Cloudflare │
│   (CDN/DNS)  │
└──────┬───────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
┌──────▼───────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Vercel      │  │  Railway    │  │   AWS S3        │
│  (Frontend)  │  │  (Backend)  │  │  (File Storage) │
└──────────────┘  └──────┬──────┘  └─────────────────┘
                         │
                  ┌──────┴──────┬────────────┐
                  │             │            │
           ┌──────▼──────┐ ┌────▼─────┐ ┌───▼────┐
           │ PostgreSQL  │ │  Redis   │ │ Sentry │
           │  (Primary)  │ │ (Cache)  │ │ (Logs) │
           └─────────────┘ └──────────┘ └────────┘
```

---

## Development Phases

### Phase 1: MVP (Months 1-2)
- Mock authentication (select from pre-seeded users)
- PDF upload and text extraction
- Basic commenting (in-app only, no social media)
- Simple text matching (exact only)
- Follow/unfollow users
- Basic reader UI (20/80 split layout)

### Phase 2: Enhanced Matching (Month 3)
- Fuzzy text matching
- EPUB support
- Web article support
- Improved UI/UX
- Comment positioning optimization

### Phase 3: Social Media & OAuth Integration (Months 4-5)
- OAuth authentication (Twitter/X, Facebook)
- Replace mock auth with real social login
- Twitter/X integration for comment import
- Social media comment parsing
- Auto-import pipeline
- Notification system

### Phase 4: Scale & Polish (Month 6+)
- Performance optimization
- Mobile responsive design
- Advanced features (comment threads, likes)
- Analytics dashboard
- Monetization (premium subscriptions)

---

## Mock Authentication Implementation (MVP)

### Overview
For the MVP, we'll implement a simple mock authentication system that allows developers and testers to quickly switch between different user personas without setting up OAuth.

### How It Works

1. **Pre-seeded Mock Users**
   - Database seeded with 5-10 mock users on initialization
   - Each mock user has: username, displayName, avatar, bio
   - Example users:
     - `@literarycritic` - "Professor of Russian Literature"
     - `@booklover` - "Reading 100 books this year"
     - `@scifigeek` - "Science fiction enthusiast"

2. **Frontend Flow**
   ```typescript
   // User selects from dropdown or user cards
   const mockUsers = await fetch('/api/auth/mock-users');

   // Click to "login" as that user
   await fetch('/api/auth/mock-login', {
     method: 'POST',
     body: JSON.stringify({ userId: selectedUserId })
   });

   // Store in localStorage
   localStorage.setItem('mockUserId', userId);
   ```

3. **Backend Middleware**
   ```typescript
   // Simple middleware to extract user from session/header
   app.use((req, res, next) => {
     const userId = req.headers['x-mock-user-id'];
     if (userId) {
       req.user = await prisma.user.findUnique({ where: { id: userId } });
     }
     next();
   });
   ```

4. **No Security** (intentional for MVP)
   - Any client can impersonate any user
   - Acceptable for local development/demo
   - Will be completely replaced in Phase 3

### Migration Path to OAuth

When implementing OAuth in Phase 3:
1. Keep mock users table structure (just add OAuth fields)
2. Add `social_provider` and `social_user_id` columns
3. Replace mock login endpoints with OAuth flow
4. Existing user references (subscriptions, comments) remain valid
5. Mock users can be deleted or converted to real accounts

---

## Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/reader_noter
REDIS_URL=redis://localhost:6379

# Not needed for MVP (mock auth)
# JWT_SECRET=your-secret-key
# JWT_REFRESH_SECRET=your-refresh-secret

# For Phase 1 (optional - can use local storage initially)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=reader-noter-files
AWS_REGION=us-east-1

# For Phase 3+ (OAuth & social media import)
# TWITTER_API_KEY=
# TWITTER_API_SECRET=
# TWITTER_BEARER_TOKEN=
# TWITTER_OAUTH_CLIENT_ID=
# TWITTER_OAUTH_CLIENT_SECRET=
# TWITTER_OAUTH_CALLBACK_URL=http://localhost:5000/api/auth/twitter/callback

FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. Initialize project structure (React + Node.js + TypeScript)
2. Set up PostgreSQL database
3. Implement Prisma schema and seed mock users
4. Build mock authentication system (user selection dropdown)
5. Create basic reader UI (20/80 split layout)
6. Implement text extraction service (PDF focus first)
7. Build commenting system (create, display, position)
8. Develop text matching algorithm (exact fingerprint first)
9. Add social features (follow/unfollow users)
10. Build comment feed (show comments from followed users)

**Phase 2+**: EPUB/web support, fuzzy matching, OAuth, social media import
