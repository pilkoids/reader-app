# Start PostgreSQL - Quick Guide

## Using Docker (Recommended - You Have Docker Installed!)

### Step 1: Start Docker Desktop

1. **Open Docker Desktop**
   - Press Windows key and search for "Docker Desktop"
   - Click to open it
   - Wait for Docker Desktop to start (you'll see a whale icon in the system tray when ready)
   - The status should show "Engine running" in the Docker Desktop window

### Step 2: Start PostgreSQL

Once Docker Desktop is running, open your terminal in the project root and run:

```bash
docker-compose up -d
```

You should see:
```
Creating network "reader-noter-app_default" with the default driver
Creating volume "reader-noter-app_postgres_data" with local driver
Creating reader-noter-postgres ... done
```

### Step 3: Verify PostgreSQL is Running

```bash
docker ps
```

You should see a container named `reader-noter-postgres` running on port 5432.

### Step 4: Run Database Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

When prompted to name the migration, type: `init`

### Step 5: Seed the Database

```bash
npm run prisma:seed
```

You should see:
```
Created user: literarycritic (Dr. Sarah Chen)
Created user: booklover (Alex Rivera)
...
Seeding completed!
```

### Step 6: Start the Backend

```bash
npm run dev
```

You should see:
```
Server is running on port 5000
Environment: development
```

### Step 7: Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

Browser should open to http://localhost:3000 and show the login page!

---

## Docker Commands Reference

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# Stop PostgreSQL and delete all data
docker-compose down -v

# View PostgreSQL logs
docker-compose logs -f postgres

# Check if PostgreSQL is running
docker ps

# Connect to PostgreSQL directly
docker exec -it reader-noter-postgres psql -U postgres -d reader_noter
```

---

## Alternative: Install PostgreSQL Natively

If you prefer not to use Docker, see `POSTGRES_SETUP.md` for native installation instructions.

---

## Next Steps After PostgreSQL is Running

1. ✅ Docker Desktop started
2. ✅ PostgreSQL container running
3. ✅ Database migrated
4. ✅ Mock users seeded
5. 🚀 Start backend: `cd backend && npm run dev`
6. 🚀 Start frontend: `cd frontend && npm start`
7. 🎉 Login at http://localhost:3000
