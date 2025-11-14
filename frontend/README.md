# Reader Noter Frontend

Frontend application for the Reader Noter platform - a social reading annotation app.

## Tech Stack

- React 18+
- TypeScript
- Tailwind CSS
- React Router v6
- Axios

## Getting Started

### Prerequisites

- Node.js 18+
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

Edit `.env` and configure the backend API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/          # Login/auth components
│   │   ├── layout/        # Dashboard, Sidebar, ReaderPane
│   │   ├── reader/        # PDF/EPUB readers
│   │   ├── comments/      # Comment components
│   │   └── social/        # Follow/subscription components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── store/             # State management (future)
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── index.tsx          # App entry point
├── .env.example           # Environment variables template
└── package.json
```

## Features

### Phase 1 (MVP - Current)
- Mock authentication (user selection)
- PDF upload and viewing
- Create and view comments
- Follow/unfollow users
- View comments from followed users

### Phase 2 (Planned)
- EPUB and web article support
- Improved text matching
- Enhanced UI/UX

### Phase 3 (Planned)
- OAuth authentication (Twitter/X)
- Social media comment import
- Advanced features

## Mock Authentication

This MVP uses a simple mock authentication system:

1. Select a user from the login screen
2. No password required
3. User ID stored in localStorage
4. Will be replaced with OAuth in Phase 3

## Development

### Adding New Components

Create components in the appropriate directory:
- `components/layout` - Layout components (Sidebar, ReaderPane, etc.)
- `components/reader` - Reading-related components
- `components/comments` - Comment-related components
- `components/auth` - Authentication components

### API Integration

Use the services in `src/services/` to interact with the backend:

```typescript
import { authService } from './services/authService';

// Example: Login as a mock user
const user = await authService.mockLogin(userId);
```

### Styling

This project uses Tailwind CSS. Add utility classes directly to components:

```tsx
<div className="flex items-center justify-between p-4 bg-gray-100">
  <h1 className="text-2xl font-bold">Reader Noter</h1>
</div>
```

## License

ISC
