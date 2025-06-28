# Step-by-Step Render Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/dakshi-goel/real_hackathon25
- Render account (free)

## Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. If using GitHub, authorize Render to access your repositories

## Step 2: Deploy Backend Service

### 2.1 Create New Web Service
1. From Render Dashboard, click **"New +"** button
2. Select **"Web Service"**

### 2.2 Connect Repository
1. You'll see "Connect a repository"
2. Find `dakshi-goel/real_hackathon25` in the list
3. Click **"Connect"**

### 2.3 Configure Backend Service
Fill in these settings:

**Basic Settings:**
- **Name**: `real-estate-backend` (or any name you prefer)
- **Region**: `Oregon (US West)` (or closest to you)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ IMPORTANT
- **Runtime**: `Node`

**Build & Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

### 2.4 Choose Free Plan
- Select **"Free"** instance type
- Note: Free tier has 512MB RAM and spins down after 15 min of inactivity

### 2.5 Add Environment Variables
Scroll down to "Environment Variables" and click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| PORT | 10000 |
| VAPI_API_KEY | 92cfcba0-038c-4008-8f78-8bfb1afdb586 |
| FRONTEND_URL | https://temp-frontend-url.com |
| NODE_ENV | production |

*Note: We'll update FRONTEND_URL after deploying frontend*

### 2.6 Create Web Service
1. Click **"Create Web Service"** button at bottom
2. Wait for deployment (takes 3-5 minutes)
3. You'll see logs showing the build process
4. Once deployed, copy the URL (e.g., `https://real-estate-backend.onrender.com`)

## Step 3: Deploy Frontend Static Site

### 3.1 Create New Static Site
1. Go back to Dashboard
2. Click **"New +"** → **"Static Site"**

### 3.2 Connect Same Repository
1. Select `dakshi-goel/real_hackathon25` again
2. Click **"Connect"**

### 3.3 Configure Frontend
**Basic Settings:**
- **Name**: `real-estate-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend` ⚠️ IMPORTANT

**Build Settings:**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 3.4 Add Frontend Environment Variables
Add these environment variables:

| Key | Value |
|-----|-------|
| REACT_APP_API_URL | [YOUR BACKEND URL from Step 2.6] |
| REACT_APP_VAPI_PUBLIC_KEY | af4d4c87-e623-4b0d-af20-dd42cdc659ac |
| REACT_APP_VAPI_ASSISTANT_ID | 74f2246e-7bdf-4f77-9dd3-2544131346c1 |

Example for REACT_APP_API_URL: `https://real-estate-backend.onrender.com`

### 3.5 Create Static Site
1. Click **"Create Static Site"**
2. Wait for deployment (takes 5-10 minutes)
3. Copy the frontend URL once deployed

## Step 4: Update Backend CORS Settings

### 4.1 Update FRONTEND_URL
1. Go to your backend service in Render Dashboard
2. Click on **"Environment"** tab
3. Find `FRONTEND_URL` variable
4. Click edit icon
5. Update value to your actual frontend URL (e.g., `https://real-estate-frontend.onrender.com`)
6. Click **"Save Changes"**
7. The service will automatically redeploy

## Step 5: Test Your Application

1. Open your frontend URL in browser
2. You should see "Dream Homes Reality" page
3. Click the microphone button
4. Allow microphone permissions
5. Say "I'm looking for a house in Austin"
6. The AI should respond and show properties

## Common Issues & Solutions

### "Failed to load properties"
- Check backend logs in Render dashboard
- Verify REACT_APP_API_URL is correct
- Ensure backend is deployed and running

### Voice not working
- Must use HTTPS (Render provides this)
- Check browser console for errors
- Verify Vapi credentials are correct

### CORS errors
- Make sure FRONTEND_URL in backend matches exactly
- Include protocol (https://)
- No trailing slash

### Build failures
- Check you set the correct root directories
- Backend: `backend`
- Frontend: `frontend`

## Monitoring Your App

### View Logs
1. Click on your service
2. Go to "Logs" tab
3. See real-time logs

### Check Metrics
- "Metrics" tab shows CPU, Memory usage
- Free tier: 512MB RAM limit

### Service Status
- Green = Running
- Yellow = Deploying
- Gray = Suspended (free tier after 15 min)

## Next Steps

1. **Custom Domain** (optional)
   - Add custom domain in Settings
   - Update DNS records

2. **Prevent Sleep** (optional)
   - Use services like UptimeRobot to ping your backend
   - Or upgrade to paid tier

3. **Database** (when needed)
   - Add PostgreSQL from Render
   - Update connection in backend

## Important URLs to Save

After deployment, save these URLs:

- Backend API: `https://[your-backend-name].onrender.com`
- Frontend App: `https://[your-frontend-name].onrender.com`
- Render Dashboard: https://dashboard.render.com

## Deployment Summary

Total time: ~15-20 minutes
- Backend deployment: 5 minutes
- Frontend deployment: 10 minutes
- Testing: 5 minutes

Your app will be live at the frontend URL with voice search enabled!