# Local Development Setup

This guide will help you set up the Reader Noter app for local development with PostgreSQL.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed (for PostgreSQL)
- Git

## Quick Start

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Verify it's running
docker ps
```

You should see `reader-noter-postgres` container running.

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# This will automatically run 'prisma generate' via postinstall script

# Run database migrations
npx prisma migrate dev

# Seed the database with mock users
npm run prisma:seed
```

You should see:
```
Created user: literarycritic (Dr. Sarah Chen)
Created user: booklover (Alex Rivera)
...
Seeding completed!
```

### 3. Start Backend Server

```bash
# Still in backend directory
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Set Up Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open automatically at `http://localhost:3000`

## Verify Everything Works

### Test Backend API

```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Reader Noter API is running",
  "timestamp": "..."
}
```

### Test Database Connection

```bash
cd backend
npx prisma studio
```

This opens Prisma Studio at `http://localhost:5555` where you can browse your database.

## Development Workflow

### Backend Changes

When you modify backend code:
- Nodemon automatically restarts the server
- No manual restart needed

### Frontend Changes

When you modify frontend code:
- React hot reloads automatically
- Browser updates instantly

### Database Schema Changes

When you modify `backend/prisma/schema.prisma`:

```bash
cd backend

# Create a new migration
npx prisma migrate dev --name describe_your_change

# Example:
npx prisma migrate dev --name add_user_preferences
```

This will:
1. Generate SQL migration files
2. Apply changes to your database
3. Regenerate Prisma Client

## Useful Commands

### Database

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Apply migrations without creating new ones
npx prisma migrate deploy

# Seed database again
npm run prisma:seed
```

### Backend

```bash
# Development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run production build locally
npm run start
```

### Frontend

```bash
# Development mode
npm start

# Build for production
npm run build

# Test production build locally
npx serve -s build
```

### Docker

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

## Environment Variables

### Backend (.env)

Already configured in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reader_noter?schema=public"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

Already configured in `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### PostgreSQL won't start

**Error:** Port 5432 already in use

**Fix:**
```bash
# Check what's using port 5432
lsof -i :5432  # Mac/Linux
netstat -ano | findstr :5432  # Windows

# Stop other PostgreSQL instance or change port in docker-compose.yml
```

### Database connection error

**Error:** `Can't reach database server at localhost:5432`

**Fix:**
```bash
# Make sure Docker is running
docker ps

# Restart PostgreSQL container
docker-compose restart postgres
```

### Prisma Client errors

**Error:** `@prisma/client did not initialize yet`

**Fix:**
```bash
cd backend
npx prisma generate
```

### Backend won't start

**Error:** Port 5000 already in use

**Fix:**
```bash
# Kill process on port 5000
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in backend/.env
```

### Frontend can't connect to backend

**Error:** Network errors in browser console

**Fix:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check `REACT_APP_API_URL` in `frontend/.env`
3. Restart frontend after changing .env

## Testing the Full Flow

1. **Login:** Visit `http://localhost:3000`, click any mock user
2. **Upload Document:** Click "Open Document", upload a PDF/EPUB/TXT file
3. **Create Comment:** Toggle "Show Comments", select text, write comment
4. **View Library:** Navigate to "My Library" to see uploaded documents
5. **Follow Users:** Go to "Social" → "Suggestions" → Follow a user
6. **View Feed:** Go to "Feed" to see comments from followed users

## Next Steps

Once local development is working:
- Make your changes
- Test thoroughly
- Commit and push to GitHub
- Follow DEPLOYMENT.md to deploy to production

## Need Help?

- Check logs: `docker-compose logs -f` or backend terminal
- Open Prisma Studio: `npx prisma studio`
- Review environment variables in `.env` files
