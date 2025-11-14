# Quick Start Guide

Get Reader Noter up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed and running

## Step 1: Set Up PostgreSQL

### On Windows

1. **Install PostgreSQL** (if not already installed):
   - Download from https://www.postgresql.org/download/windows/
   - Run the installer
   - Remember the password you set for the `postgres` user

2. **Start PostgreSQL service** (if not running):
   ```bash
   # Open Services (Win + R, type 'services.msc')
   # Find 'postgresql-x64-15' and start it
   # OR use command line:
   net start postgresql-x64-15
   ```

3. **Create the database**:
   ```bash
   # Open Command Prompt or PowerShell
   psql -U postgres
   # Enter your postgres password when prompted

   # In psql prompt:
   CREATE DATABASE reader_noter;
   \q
   ```

### On Mac/Linux

```bash
# Install PostgreSQL (if not installed)
# Mac: brew install postgresql@15
# Ubuntu: sudo apt-get install postgresql-15

# Start PostgreSQL
# Mac: brew services start postgresql@15
# Ubuntu: sudo service postgresql start

# Create database
createdb reader_noter
```

## Step 2: Configure Backend

```bash
cd backend

# Environment variables are already set in backend/.env
# Default connection: postgresql://postgres:postgres@localhost:5432/reader_noter
# If your PostgreSQL has a different password, edit backend/.env
```

## Step 3: Initialize Database

```bash
# Still in backend directory

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database with mock users
npm run prisma:seed
```

You should see output like:
```
Created user: literarycritic (Dr. Sarah Chen)
Created user: booklover (Alex Rivera)
...
Seeding completed!
```

## Step 4: Start Backend

```bash
# Still in backend directory
npm run dev
```

You should see:
```
Server is running on port 5000
Environment: development
```

## Step 5: Start Frontend

Open a **new terminal** window:

```bash
cd frontend
npm start
```

Browser should automatically open to `http://localhost:3000`

## Step 6: Login

1. You'll see the login page with 8 mock users
2. Click any user card to login (no password needed)
3. You'll be redirected to the dashboard

## Mock Users Available

After seeding, you can login as:

| Username | Display Name | Description |
|----------|--------------|-------------|
| literarycritic | Dr. Sarah Chen | Professor of Russian Literature |
| booklover | Alex Rivera | Reading 100 books this year |
| scifigeek | Jordan Kim | Science fiction enthusiast |
| classicreader | Emma Thompson | Only reading books before 1950 |
| poetrycorner | Marcus Lee | Poetry and prose lover |
| mysteryfan | Rachel Adams | True crime and mystery novels |
| philosophyreads | David Patel | Exploring existentialism |
| fantasylover | Luna Martinez | Dragons, magic, epic quests |

## Verify Everything is Working

### Test Backend API

```bash
# In a new terminal
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

### Test Auth Endpoint

```bash
curl http://localhost:5000/api/auth/mock-users
```

Should return an array of 8 users.

## Troubleshooting

### PostgreSQL Not Running

**Error**: `Can't reach database server at localhost:5432`

**Fix**:
```bash
# Windows
net start postgresql-x64-15

# Mac
brew services start postgresql@15

# Ubuntu
sudo service postgresql start
```

### Database Doesn't Exist

**Error**: `database "reader_noter" does not exist`

**Fix**:
```bash
# Create the database
psql -U postgres
CREATE DATABASE reader_noter;
\q

# Then run migrations again
npm run prisma:migrate
```

### Wrong PostgreSQL Password

**Error**: `password authentication failed for user "postgres"`

**Fix**: Edit `backend/.env` and change the password in the DATABASE_URL:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/reader_noter?schema=public"
```

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Fix**: Either:
1. Stop the process using port 5000
2. Or change the port in `backend/.env`:
   ```
   PORT=5001
   ```
   And update `frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

### Frontend Can't Connect to Backend

**Error**: Network errors in browser console

**Fix**:
1. Make sure backend is running (`npm run dev` in backend folder)
2. Check `frontend/.env` has correct API URL
3. Restart frontend after changing .env

## What's Next?

Now that authentication is working, the next features to build are:

1. **Reader UI** - 20/80 split layout (Sidebar + Reader Pane)
2. **PDF Upload** - Upload and extract text from PDFs
3. **Comments** - Create and view annotations
4. **Subscriptions** - Follow users and see their comments

See `system-architecture.md` for the complete roadmap.

## Development Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend
```bash
npm start            # Start dev server
npm run build        # Build for production
npm test             # Run tests
```

## Need Help?

- Check `README.md` for detailed documentation
- Review `system-architecture.md` for technical details
- See `prompts.md` for design decisions and rationale
