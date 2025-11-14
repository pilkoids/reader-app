# PostgreSQL Installation Guide

## Option 1: Install PostgreSQL Natively (Recommended)

### Windows Installation

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Download PostgreSQL 15 or higher

2. **Run the Installer**
   - Run the downloaded .exe file
   - Click "Next" through the welcome screens
   - **Installation Directory**: Use default (e.g., `C:\Program Files\PostgreSQL\15`)
   - **Components**: Select all (PostgreSQL Server, pgAdmin 4, Command Line Tools)
   - **Data Directory**: Use default
   - **Password**: Set a password for the `postgres` superuser (remember this!)
   - **Port**: Use default `5432`
   - **Locale**: Use default
   - Click "Next" and "Finish"

3. **Add PostgreSQL to PATH** (if not automatic)
   - Open "Environment Variables" (Win + R, type `sysdm.cpl`, Advanced tab)
   - Edit "Path" in System variables
   - Add: `C:\Program Files\PostgreSQL\15\bin`
   - Click OK and restart your terminal

4. **Verify Installation**
   ```bash
   psql --version
   # Should show: psql (PostgreSQL) 15.x
   ```

5. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   # Enter the password you set during installation

   # In the psql prompt:
   CREATE DATABASE reader_noter;
   \l  # List databases - you should see reader_noter
   \q  # Quit
   ```

6. **Update Backend Configuration**
   Edit `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/reader_noter?schema=public"
   ```
   Replace `YOUR_PASSWORD` with the password you set.

7. **Run Migrations and Seed**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

---

## Option 2: Use Docker (Fastest Setup)

If you have Docker Desktop installed, this is the quickest way to get PostgreSQL running.

### Using Docker

1. **Install Docker Desktop** (if not installed)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Create docker-compose.yml** (already created in your project)

3. **Start PostgreSQL**
   ```bash
   # In the project root
   docker-compose up -d
   ```

4. **Verify PostgreSQL is Running**
   ```bash
   docker ps
   # Should show a postgres container running on port 5432
   ```

5. **Run Migrations and Seed**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

6. **To Stop PostgreSQL**
   ```bash
   docker-compose down
   ```

---

## Option 3: Use SQLite (Quick Test - Not Recommended for Production)

For quick testing, you can use SQLite instead of PostgreSQL.

### Switch to SQLite

1. **Update Prisma Schema**
   Edit `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Remove PostgreSQL-specific Features**
   - Remove `@db.Uuid` decorators
   - Change `@default(dbgenerated("gen_random_uuid()"))` to `@default(uuid())`
   - Remove `@@index([timestamp(sort: Desc)])` (SQLite doesn't support this)

3. **Update Environment**
   Edit `backend/.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```

4. **Run Migrations and Seed**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

**Note**: SQLite is simpler but lacks features like full-text search (pg_trgm) needed for Phase 2 fuzzy text matching. Use for testing only.

---

## Recommended: Option 2 (Docker)

Docker is the fastest way to get started and most closely matches production environments.

Let me know which option you'd like to proceed with!
