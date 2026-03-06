# Deployment Guide for Render

## Prerequisites
- GitHub repository with your code
- Render account (free tier available at render.com)
- PostgreSQL database (Render provides free tier)

## Step 1: Prepare Your Code
✅ Already done! Your backend is now configured for Render with:
- PostgreSQL support (replaced SQLite)
- Environment variables support
- render.yaml configuration
- .env.example for reference

## Step 2: Push to GitHub
```bash
git add .
git commit -m "Update backend for Render deployment"
git push origin main
```

## Step 3: Deploy Backend on Render

### Option A: Using render.yaml (Recommended - Easiest)
1. Go to [render.com](https://render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Select "palliative" repository
5. Render will auto-detect render.yaml and deploy both web service + database
6. ✅ Done! Your backend will be live with automatic database

### Option B: Manual Setup
1. Go to [render.com](https://render.com)
2. Create New → Web Service
3. Connect GitHub repo → Select your branch
4. Configure:
   - **Name:** palliative-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Add Environment Variable:
   - Create PostgreSQL database first (see below)
   - Copy CONNECTION_STRING to DATABASE_URL
6. Deploy

### Create PostgreSQL Database on Render
1. Dashboard → New + → PostgreSQL
2. Configure:
   - **Name:** palliative_db
   - **Database:** palliative_db
   - **Region:** Same as backend
   - **Plan:** Free
3. Copy the Internal Database URL
4. Add to your backend service as `DATABASE_URL` env var

## Step 4: Get Your Backend URL
Once deployed, Render will provide a URL like:
```
https://palliative-backend.onrender.com
```

## Step 5: Deploy Frontend on Vercel

### Update API Endpoint in Frontend
Update all API calls in your HTML files from:
```javascript
// OLD (local)
fetch('http://localhost:3000/api/...')

// NEW (Render backend)
fetch('https://palliative-backend.onrender.com/api/...')
```

Or use environment-based URL:
```javascript
const API_URL = 'https://palliative-backend.onrender.com';
fetch(`${API_URL}/api/equipments`)
```

### Deploy Frontend
1. Go to [vercel.com](https://vercel.com)
2. Import → GitHub → Select repo
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** ./frontend
4. Deploy

## Environment Variables Summary

### Backend (.env file on Render)
```
NODE_ENV=production
DATABASE_URL=postgresql://...  (auto-set by Render)
PORT=3000  (auto-set)
```

## Testing Deployment
```bash
# Test backend API
curl https://palliative-backend.onrender.com/api/stats

# Should return:
# {"patients":0,"orders":0,"donations":0,"equipments":0,"totalDonated":0,"totalUnits":0}
```

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL env var is set
- Check Render dashboard for database status
- Verify internal URL is in correct format

### CORS Issues
- Backend already has CORS enabled
- Make sure frontend URL matches origin

### Free Tier Limits
- Render free tier apps spin down after 15 min inactivity
- Free PostgreSQL has 256MB storage limit
- Upgrade when data grows or more traffic needed

## Local Development

1. Install PostgreSQL locally
2. Create database:
   ```psql
   CREATE DATABASE palliative_db;
   ```
3. Create .env file:
   ```
   DATABASE_URL=postgresql://localhost/palliative_db
   NODE_ENV=development
   PORT=3000
   ```
4. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```

## Cost Estimation
- **Free Tier:** $0/month (with limitations)
- **Paid (if needed):** $7-15/month per service

---
For issues, check Render dashboard logs or contact Render support.
