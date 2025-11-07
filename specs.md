# Reader App - Architecture Specification

## Executive Summary

A social reading platform that allows users to share and discover annotations on reading materials. Users can highlight text, leave comments, and subscribe to other readers' annotations. The system integrates with social media platforms to parse and display comments.

## Potential Issues & Concerns

### 1. Copyright Concerns
**Major Issue**: Storing entire text of copyrighted materials could violate copyright law.

**Considerations:**
- **Fair Use**: Snippets and quotes may qualify for fair use, but storing entire texts likely does not
- **Publisher Agreements**: Would need licenses from publishers for full-text storage
- **User-Generated Content**: May expose platform to DMCA takedown requests
- **Legal Liability**: Could face lawsuits from publishers and authors

**Recommended Approaches:**
- **Option A (Preferred)**: Store only text fingerprints/hashes and anchors, not full text
  - Users must have their own copy of the material
  - Comments are anchored to text positions using fuzzy matching
  - More legally defensible

- **Option B**: Partner with publishers for licensed content
  - Limited catalog but legal
  - Requires business agreements

- **Option C**: User-uploaded content only with DMCA compliance
  - Implement takedown procedures
  - Terms of service making users responsible

### 2. Technical Challenges

**Text Matching Across Formats:**
- Same book in different formats (PDF, EPUB, hardcover, paperback) may have different pagination
- OCR errors in scanned documents
- Different editions with revised text
- Solution: Use content-based anchoring with fuzzy matching algorithms

**Text Extraction:**
- PDFs may have selectable text or require OCR
- Screenshots require OCR (less accurate)
- EPUBs are structured but can have different encodings
- Web articles may have dynamic content

**Performance & Scale:**
- Text search and matching at scale requires sophisticated indexing
- Real-time comment synchronization across users
- Large text corpus storage and retrieval

### 3. Privacy & Moderation
- User reading habits are sensitive data
- Comments may contain harassment, spoilers, or inappropriate content
- Need moderation system and reporting mechanisms

## Proposed System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web App     │  │  Mobile App  │  │  Browser Ext.    │  │
│  │  (React)     │  │  (iOS/And.)  │  │  (Chrome/FF)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY / LOAD BALANCER              │
│                       (nginx / AWS ALB)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│   BACKEND API SERVICE     │  │  WEBSOCKET SERVICE       │
│   (Node.js / Python)      │  │  (Real-time updates)     │
│                           │  │                          │
│  • Authentication         │  │  • Live annotations      │
│  • User Management        │  │  • Notifications         │
│  • Annotation CRUD        │  │  • Presence              │
│  • Subscription Logic     │  │                          │
│  • Content Management     │  │                          │
└───────────────────────────┘  └──────────────────────────┘
        │         │
        │         └──────────────────┐
        ▼                            ▼
┌────────────────────┐    ┌────────────────────────────┐
│  TEXT PROCESSING   │    │  SOCIAL MEDIA INTEGRATION  │
│      SERVICE       │    │        SERVICE             │
│                    │    │                            │
│  • Text Extract.   │    │  • Twitter/X API           │
│  • OCR Engine      │    │  • Comment Parser          │
│  • Fingerprinting  │    │  • Bot Handler             │
│  • Fuzzy Matching  │    │  • Content Extraction      │
│  • Text Anchoring  │    │                            │
└────────────────────┘    └────────────────────────────┘
        │                            │
        └──────────┬─────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │  Elasticsearch│ │   Object Store  │  │
│  │              │  │             │  │   (S3/MinIO)     │  │
│  │  • Users     │  │  • Text     │  │                  │  │
│  │  • Docs      │  │  • Search   │  │  • Uploaded      │  │
│  │  • Annot.    │  │  • Indexing │  │    Documents     │  │
│  │  • Subs      │  │             │  │  • Images        │  │
│  └──────────────┘  └─────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐                         │
│  │    Redis     │  │  Message Q  │                         │
│  │              │  │  (RabbitMQ) │                         │
│  │  • Sessions  │  │             │                         │
│  │  • Cache     │  │  • Jobs     │                         │
│  │  • Pub/Sub   │  │  • Tasks    │                         │
│  └──────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Client Applications

**Web Application (Primary)**
- React/Next.js with TypeScript
- PDF viewer integration (PDF.js)
- EPUB reader (EPUB.js)
- Text selection and highlighting UI
- Real-time comment overlay system
- User profile and subscription management

**Mobile Applications**
- React Native (cross-platform)
- Native document viewers
- Camera integration for screenshots
- OCR processing on device

**Browser Extension (Optional Phase 2)**
- Injects annotation layer on web articles
- Shares annotations across users reading same URL

### 2. Backend API Service

**Technology Stack:**
- **Runtime**: Node.js (Express) or Python (FastAPI)
- **Language**: TypeScript or Python
- **Authentication**: JWT tokens with refresh mechanism
- **API Style**: RESTful with GraphQL consideration for complex queries

**Core Modules:**

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management & profiles
├── documents/         # Document metadata management
├── annotations/       # Comment/highlight CRUD
├── subscriptions/     # Follow/subscription logic
├── feeds/             # Personalized annotation feeds
├── moderation/        # Content moderation
└── notifications/     # User notifications
```

**Key Endpoints:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/:id
POST   /api/v1/documents              # Create document entry
GET    /api/v1/documents/:id
POST   /api/v1/annotations            # Create annotation
GET    /api/v1/annotations?documentId=&userId=
PUT    /api/v1/annotations/:id
DELETE /api/v1/annotations/:id
POST   /api/v1/subscriptions          # Subscribe to user
GET    /api/v1/feed                   # Get personalized feed
```

### 3. Text Processing Service

**Purpose**: Handle text extraction, fingerprinting, and matching

**Technology Stack:**
- Python (best ML/NLP libraries)
- Tesseract OCR
- PyMuPDF / pdfplumber for PDF extraction
- ebooklib for EPUB
- NLTK / spaCy for text processing

**Core Functionality:**

**Text Fingerprinting:**
```python
# Generate content-based fingerprint for text passage
def create_text_fingerprint(text, context_chars=200):
    """
    Creates a robust anchor for text that works across editions
    - Hash of normalized text
    - Surrounding context hashes
    - Word sequence signatures
    """
    normalized = normalize_text(text)
    return {
        'content_hash': hash(normalized),
        'prefix_hash': hash(normalized_prefix),
        'suffix_hash': hash(normalized_suffix),
        'word_sequence': extract_key_words(normalized)
    }
```

**Fuzzy Matching:**
- Use Levenshtein distance for finding similar text
- Account for OCR errors, formatting differences
- Match annotations to text even if exact string doesn't exist
- Return confidence score for matches

**Text Anchoring Strategy:**
```json
{
  "anchor": {
    "type": "text-quote",
    "exact": "the highlighted text",
    "prefix": "20 chars before",
    "suffix": "20 chars after",
    "fingerprint": {
      "content_hash": "abc123...",
      "word_sequence": ["key", "words", "from", "passage"]
    }
  },
  "position": {
    "page": 42,
    "paragraph": 3,
    "charOffset": 150
  }
}
```

### 4. Social Media Integration Service

**Purpose**: Parse and ingest comments from social media platforms

**Technology Stack:**
- Node.js or Python
- Twitter API v2
- Webhook handlers
- Queue-based processing

**Comment Parsing:**
```
Input Format (strict):
"[Book Title] - [Chapter/Page] - [Paragraph #] - '[Quoted Text]' - [Comment]"

Example:
"Crime and Punishment - Chapter 2 - Para 5 - 'And then I stabbed the old hag' - omg Raskolnikov!!!"
```

**Parser Logic:**
1. Extract structured data from tweet
2. Look up document by title
3. Find paragraph using position hints
4. Create text anchor using quoted text
5. Create annotation in system
6. Link to original social media post

**Bot Account:**
- Monitor @mentions
- Validate post format
- Reply with confirmation or error
- Rate limiting and spam protection

### 5. WebSocket Service

**Purpose**: Real-time updates for collaborative reading experience

**Technology**: Socket.io or native WebSocket

**Features:**
- Live annotation updates
- Presence indicators (who's reading what)
- Real-time notifications
- Collaborative reading sessions

### 6. Data Models

**User:**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Document:**
```typescript
interface Document {
  id: string;
  title: string;
  author?: string;
  isbn?: string;              // For books
  url?: string;               // For articles
  contentFingerprint: string; // Hash of content
  type: 'pdf' | 'epub' | 'article' | 'screenshot';
  metadata: {
    edition?: string;
    publisher?: string;
    publicationDate?: Date;
    pageCount?: number;
  };
  // Note: NOT storing full text for copyright reasons
  createdAt: Date;
}
```

**Annotation:**
```typescript
interface Annotation {
  id: string;
  userId: string;
  documentId: string;
  type: 'highlight' | 'comment' | 'note';
  content: string;              // The actual comment
  anchor: TextAnchor;           // How to find the text
  visibility: 'public' | 'followers' | 'private';
  socialMediaSource?: {
    platform: 'twitter' | 'x';
    postId: string;
    postUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TextAnchor {
  exact: string;                // Exact text quoted
  prefix: string;               // Text before
  suffix: string;               // Text after
  fingerprint: {
    contentHash: string;
    wordSequence: string[];
  };
  position?: {
    page?: number;
    paragraph?: number;
    charOffset?: number;
  };
}
```

**Subscription:**
```typescript
interface Subscription {
  id: string;
  subscriberId: string;         // User doing the subscribing
  subscribedToId: string;       // User being subscribed to
  createdAt: Date;
}
```

## Data Storage Strategy

### PostgreSQL (Primary Database)
- User accounts and profiles
- Document metadata (NOT full text)
- Annotations and comments
- Subscriptions and relationships
- Moderation data

### Elasticsearch
- Full-text search for annotations
- Document discovery
- Text matching and fuzzy search
- Fast retrieval of relevant annotations

### Redis
- Session management
- Real-time presence
- Cache layer for frequently accessed data
- Pub/sub for WebSocket coordination

### Object Storage (S3/MinIO)
- User-uploaded documents (with encryption)
- Profile images and avatars
- Cached OCR results
- Document thumbnails

## Implementation Phases

### Phase 1: MVP (Core Reading & Annotation)
- [x] User authentication
- [ ] Document upload (PDF only initially)
- [ ] Text extraction and fingerprinting
- [ ] Basic annotation creation
- [ ] View own annotations
- [ ] Basic user profiles

### Phase 2: Social Features
- [ ] User subscriptions
- [ ] Personalized feed
- [ ] View annotations from followed users
- [ ] Notification system
- [ ] Search for users and documents

### Phase 3: Text Matching & Multi-format
- [ ] Fuzzy text matching
- [ ] EPUB support
- [ ] Web article support
- [ ] Screenshot OCR
- [ ] Cross-edition matching

### Phase 4: Social Media Integration
- [ ] Twitter/X bot
- [ ] Comment parser
- [ ] Social media authentication
- [ ] Cross-posting features

### Phase 5: Advanced Features
- [ ] Browser extension
- [ ] Mobile apps
- [ ] Collaborative reading sessions
- [ ] Discussion threads
- [ ] Content moderation tools

## Security Considerations

1. **Authentication & Authorization**
   - JWT with refresh tokens
   - OAuth2 for social login
   - Row-level security for annotations

2. **Content Security**
   - Input sanitization (prevent XSS)
   - Rate limiting on API endpoints
   - DMCA takedown procedures
   - Content moderation queue

3. **Privacy**
   - Encryption at rest for documents
   - Private/public annotation controls
   - Data export capabilities (GDPR)
   - User data deletion

4. **API Security**
   - API key management for social media
   - Request validation
   - CORS configuration
   - DDoS protection

## Performance Optimization

1. **Caching Strategy**
   - Redis for session data
   - CDN for static assets
   - Database query result caching
   - Pre-computed feeds

2. **Database Optimization**
   - Proper indexing on foreign keys
   - Pagination for all list endpoints
   - Database connection pooling
   - Read replicas for scaling

3. **Text Processing**
   - Async job queue for OCR
   - Background processing for text extraction
   - Batch fingerprint generation
   - Caching of matching results

## Scalability Considerations

- Horizontal scaling of API servers
- Database sharding by user ID or document ID
- Microservices architecture for independent scaling
- Message queue for async tasks
- CDN for global content delivery

## Monitoring & Observability

- Application logging (structured JSON)
- Error tracking (Sentry)
- Performance monitoring (DataDog, New Relic)
- Database query monitoring
- User analytics (privacy-respecting)

## Legal & Compliance

1. **Terms of Service**
   - Users responsible for uploaded content
   - Clear copyright policies
   - Content takedown procedures

2. **Privacy Policy**
   - GDPR compliance
   - CCPA compliance
   - Data retention policies

3. **DMCA Compliance**
   - Designated agent
   - Takedown procedures
   - Counter-notification process

## Alternative Approach: Hypothesis-like System

Consider using the **Web Annotation Data Model** standard:
- Industry standard for annotations
- Better interoperability
- Open source tools available (Hypothesis)
- Could leverage existing infrastructure

This would shift the architecture to be more standards-compliant and potentially easier to integrate with academic/research tools.

## Conclusion

The proposed architecture balances functionality with legal considerations by avoiding full-text storage. The text anchoring system allows annotations to work across editions while minimizing copyright concerns. The phased approach allows for iterative development and user feedback before investing in complex features like social media integration.

**Key Recommendation**: Start with Phase 1 MVP without storing full text content, require users to provide their own documents, and implement robust text anchoring. This approach is more legally defensible and technically feasible.
