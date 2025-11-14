# How to Start Reader Noter App

The database is currently locked by background processes. Follow these steps to get everything running:

## Quick Fix (Recommended)

1. **Close ALL terminal windows**

2. **Open Task Manager** (Ctrl + Shift + Esc)
   - Find all "Node.js JavaScript Runtime" processes
   - Right-click each one → "End task"

3. **Open TWO new terminal windows**

4. **Terminal 1 - Backend:**
   ```bash
   cd C:\Users\Beast\Documents\reader-noter-app\backend
   npm run dev
   ```

   Wait until you see:
   ```
   Server is running on port 5000
   Environment: development
   ```

5. **Terminal 2 - Frontend:**
   ```bash
   cd C:\Users\Beast\Documents\reader-noter-app\frontend
   npm start
   ```

   Your browser will automatically open to http://localhost:3000

## What You Should See

1. **Login Page** with 8 mock users:
   - Dr. Sarah Chen (@literarycritic)
   - Alex Rivera (@booklover)
   - Jordan Kim (@scifigeek)
   - Emma Thompson (@classicreader)
   - Marcus Lee (@poetrycorner)
   - Rachel Adams (@mysteryfan)
   - David Patel (@philosophyreads)
   - Luna Martinez (@fantasylover)

2. **Click any user** to login (no password needed)

3. **Dashboard** with your user info

## Troubleshooting

### If backend shows errors:
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Wait 5 seconds, then restart backend
cd backend
npm run dev
```

### If you still get database errors:
```bash
cd backend

# Remove the locked database
rm -f prisma/dev.db prisma/dev.db-journal

# Recreate it
node setup-db.js
node fresh-setup.js

# Start server
npm run dev
```

### Test backend is working:
Open a browser to: http://localhost:5000/health

Should see:
```json
{
  "status": "ok",
  "message": "Reader Noter API is running"
}
```

### Test auth endpoint:
http://localhost:5000/api/auth/mock-users

Should see a list of 8 users.

## Next Steps

Once logged in, you can start building:
- PDF reader UI
- Comment system
- User subscriptions
- Text matching

See `system-architecture.md` for the full roadmap!
