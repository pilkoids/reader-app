# Deployment Guide - Free Tier

This guide will help you deploy the Reader Noter app to free hosting services.

## Architecture

- **Frontend:** Vercel (Free tier)
- **Backend:** Render (Free tier)
- **Database:** Neon PostgreSQL (Free tier) OR Render PostgreSQL (Free tier)
- **CI/CD:** GitHub Actions (Free for public repos)

---

## Step 1: Prepare Your Repository

1. **Push code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Create a develop branch** for testing:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

---

## Step 2: Set Up Database (Choose One)

### Option A: Neon PostgreSQL (Recommended - doesn't sleep)

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create a new project: `reader-noter-db`
4. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb`)
5. Save it for later - you'll need it for Render

### Option B: Render PostgreSQL (Alternative - same platform as backend)

Skip this - the `render.yaml` file will automatically create a PostgreSQL database when you deploy to Render.

---

## Step 3: Deploy Backend to Render

1. **Go to https://render.com**
2. **Sign up** with GitHub
3. Click **"New +"** → **"Blueprint"**
4. **Connect your GitHub repository**
5. **Select the `reader-app` repository**
6. Render will detect `render.yaml` and show:
   - Service: `reader-noter-backend`
   - Database: `reader-noter-db` (if using Render PostgreSQL)
7. Click **"Apply"**

### Set Environment Variables (in Render dashboard)

After deployment starts, go to your backend service settings:

1. Navigate to **Environment** tab
2. Add these variables:
   - `FRONTEND_URL`: (You'll get this from Vercel - come back after Step 4)
   - `DATABASE_URL`: (If using Neon, paste the connection string here. If using Render PostgreSQL, this is auto-set)

### Run Migrations

After the backend deploys:

1. Go to your backend service in Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

This creates tables and seed mock users.

---

## Step 4: Deploy Frontend to Vercel

1. **Go to https://vercel.com**
2. **Sign up** with GitHub
3. Click **"Add New..."** → **"Project"**
4. **Import your GitHub repository**
5. Configure the project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL` = `https://reader-noter-backend.onrender.com/api`
     (Replace with your actual Render backend URL)

7. Click **"Deploy"**

### Get Your Vercel URL

After deployment:
- Your frontend will be at: `https://reader-noter-frontend.vercel.app` (or similar)
- Copy this URL

### Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Save changes (this will redeploy the backend)

---

## Step 5: Verify Deployment

1. Visit your Vercel URL
2. You should see the login page
3. Try logging in as a mock user
4. Test uploading a document and creating comments

### Check Backend Health

Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "message": "Reader Noter API is running",
  "timestamp": "..."
}
```

---

## Step 6: Set Up GitHub Actions CI/CD

The `.github/workflows/deploy.yml` file is already created. It will:

✅ Run TypeScript checks on every push
✅ Build backend and frontend
✅ Run tests (when you add them)
✅ Auto-deploy on push to `main` or `develop` branches

**Automatic Deploys:**
- **Render:** Auto-deploys when you push to `main` (configure in Render settings)
- **Vercel:** Auto-deploys when you push to `main` (enabled by default)

### Configure Auto-Deploy

**Render:**
1. Go to your backend service settings
2. Under **Build & Deploy** → **Auto-Deploy**
3. Select **"Yes"** and choose `main` branch

**Vercel:**
- Already enabled by default for `main` branch
- To add `develop` branch: Go to Settings → Git → Deploy Branches

---

## Development Workflow

### Local Development
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm start
```

### Deploy to Development Server
```bash
git checkout develop
git add .
git commit -m "New feature"
git push origin develop
```
- Vercel will auto-deploy to a preview URL
- Render will deploy if you've enabled auto-deploy for `develop` branch

### Deploy to Production
```bash
git checkout main
git merge develop
git push origin main
```
- Both services auto-deploy to production URLs

---

## Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited bandwidth
- ✅ 100 GB-hours compute per month
- ✅ Automatic HTTPS
- ✅ Preview deployments for every commit

### Render (Backend)
- ⚠️ **Spins down after 15 minutes of inactivity** (free tier)
- ⚠️ First request after sleep takes ~30 seconds
- ✅ 750 hours per month (enough for one always-on service)
- ✅ Automatic HTTPS
- 💡 **Tip:** Upgrade to $7/month Starter plan to prevent sleep

### Neon PostgreSQL (Database)
- ✅ 0.5 GB storage
- ✅ 3 GB data transfer per month
- ✅ Does NOT sleep
- ✅ 1 project (unlimited databases)

### Render PostgreSQL (Alternative)
- ⚠️ **Expires after 90 days** (free tier)
- ✅ 1 GB storage
- 💡 **Recommendation:** Use Neon instead for persistence

---

## Troubleshooting

### Backend won't start
- Check Render logs: Service → Logs tab
- Verify `DATABASE_URL` is set correctly
- Make sure migrations ran: `npx prisma migrate deploy`

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` is set in Vercel
- Verify CORS settings in backend allow your Vercel domain
- Check `FRONTEND_URL` is set in Render

### Database connection errors
- Verify `DATABASE_URL` format is correct
- Check Neon/Render database is active
- Ensure database is in same region (preferably)

### Backend is slow
- Free tier spins down after 15 minutes inactivity
- First request wakes it up (~30 seconds)
- Consider upgrading to Render Starter plan ($7/month)

---

## Cost Breakdown

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| **Vercel** | Unlimited bandwidth | $20/month (Pro) |
| **Render** | 750 hours/month | $7/month (Starter - no sleep) |
| **Neon** | 0.5 GB storage | $19/month (Scale) |
| **GitHub Actions** | 2,000 minutes/month | $4/month (extra 3,000 min) |

**Total Free:** $0/month
**Recommended Upgrade (Render Starter):** $7/month - eliminates backend sleep

---

## Next Steps

1. ✅ Deploy and test the app
2. 📊 Monitor Render logs for errors
3. 🔐 Set up OAuth (Phase 3) - replace mock auth
4. 📈 Add analytics (e.g., Vercel Analytics - free)
5. 🚀 Share with beta testers!

---

## URLs (Update these after deployment)

- **Frontend (Production):** https://your-app.vercel.app
- **Backend (Production):** https://reader-noter-backend.onrender.com
- **Database:** (Neon dashboard or Render dashboard)

**Frontend (Development):** Auto-generated preview URL on each commit to `develop`
**Backend (Development):** Optional - create a second Render service for `develop` branch
