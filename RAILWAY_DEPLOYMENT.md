# Deploy to Railway (FREE & EASY)

Railway is perfect for beginners - just connect GitHub and you're done!

---

## Step 1: Create Railway Account (2 minutes)

1. Go to https://railway.app
2. Click **"Start Free"**
3. Sign up with GitHub (easiest option)
4. Authorize Railway to access your repositories

---

## Step 2: Create a New Project

1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub"**
3. Select your repository: **millet-dashboard**
4. Click **"Deploy"**

---

## Step 3: Add PostgreSQL Database

1. In Railway dashboard, click **"Add Service"** or **"+"**
2. Select **"PostgreSQL"**
3. Railway auto-creates DB and adds connection string

---

## Step 4: Configure Backend Service

Railway will auto-detect your project structure:

1. **Delete the auto-created frontend service** (we'll handle differently)
2. Click on **Backend Service** → **Settings**
3. Set **Root Directory**: `backend`
4. Set **Start Command**: 
   ```
   uvicorn app.main:app --host 0.0.0.0
   ```
5. Add Environment Variables:
   - `DATABASE_URL` - Copy from PostgreSQL service connection
   - `PYTHONUNBUFFERED` = `1`

---

## Step 5: Deploy Frontend

**Option A: Railway (Recommended - Free)**

1. Click **"Add Service"** → **"Empty Service"**
2. Name it: `frontend`
3. Go to **Service Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l 3000`
   - **Auto Deploy**: Off (optional)

4. Add Environment Variable:
   - `REACT_APP_API_URL` = Your Railway backend URL (looks like `https://projectname-production.up.railway.app`)

**Option B: Vercel (Simplest for React)**
- Go to https://vercel.com
- Import repository
- Set `REACT_APP_API_URL` environment variable
- Deploy

---

## Step 6: Update Your Frontend API Connection

Update [frontend/src/services/api.js](frontend/src/services/api.js):

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  // ... rest of config
});
```

---

## Step 7: Update Backend CORS

Update [backend/app/main.py](backend/app/main.py):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Get frontend URL from environment
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Step 8: Push & Deploy

```bash
cd d:\millet-dashboard

# Add changes
git add frontend/src/services/api.js backend/app/main.py
git commit -m "Configure API URLs for Railway deployment"
git push origin main
```

Railway will automatically redeploy when you push!

---

## Getting Your Deployed URLs

In Railway Dashboard:
- Click each service
- Copy the **Public URL** (looks like `https://servicename-production.up.railway.app`)
- Set these as environment variables in the other service:
  - Backend needs `FRONTEND_URL`
  - Frontend needs `REACT_APP_API_URL`

---

## Free Tier Limits

✅ **Included:**
- $5/month credit (renewed monthly)
- 1 PostgreSQL database
- Unlimited deployments
- Custom domains

⚠️ **Limits:**
- 500MB RAM per service (enough for small apps)
- After $5 credit runs out: Pay-as-you-go ($0.001 per CPU-minute)

---

## Verify It Works

1. Visit your **Frontend URL** in browser
2. Check Network tab (DevTools) - verify API calls work
3. If errors, check **Logs** in Railway dashboard:
   - Click service → View Logs
   - Look for errors

---

## Troubleshooting

**Frontend doesn't load:**
```
Check REACT_APP_API_URL is set correctly
Check backend is running (view logs)
```

**API calls fail (CORS errors):**
```
Update FRONTEND_URL in backend
Update allow_origins in CORS middleware
```

**Database connection fails:**
```
Copy fresh DATABASE_URL from PostgreSQL service
Restart backend service
```

**Port in use:**
```
Railway assigns ports automatically - no need to specify
```

---

## Next Steps

- Monitor logs in Railway dashboard
- Set up webhooks for GitHub commits if you want auto-deploy
- Add custom domain (Settings → Domains)

That's it! Your app should be live in minutes! 🚀

Questions? Check Railway docs: https://docs.railway.app
