# Production Deployment Guide

## Quick Deploy to Render (Free & Easy)

### Step 1: Sign up for Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `dakshi-goel/real_hackathon25`
3. Configure the backend:
   - **Name**: `real-estate-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`

4. Add Environment Variables (click "Advanced"):
   ```
   PORT=10000
   VAPI_API_KEY=92cfcba0-038c-4008-8f78-8bfb1afdb586
   FRONTEND_URL=https://your-frontend-url.onrender.com
   NODE_ENV=production
   ```

5. Click "Create Web Service"

### Step 3: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect the same repository
3. Configure the frontend:
   - **Name**: `real-estate-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://real-estate-backend.onrender.com
   REACT_APP_VAPI_PUBLIC_KEY=af4d4c87-e623-4b0d-af20-dd42cdc659ac
   REACT_APP_VAPI_ASSISTANT_ID=74f2246e-7bdf-4f77-9dd3-2544131346c1
   ```

5. Click "Create Static Site"

### Step 4: Update CORS

Once both are deployed:
1. Go to your backend service settings
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. The backend will automatically restart

### Step 5: Test Your App

1. Open your frontend URL (e.g., `https://real-estate-frontend.onrender.com`)
2. Click the microphone button
3. Test voice search functionality

## Alternative: Deploy with Docker (VPS)

If you have a VPS or cloud server:

```bash
# SSH into your server
ssh user@your-server-ip

# Clone the repository
git clone https://github.com/dakshi-goel/real_hackathon25.git
cd real_hackathon25

# Create production .env file
nano .env
# Add all your environment variables

# Run with Docker Compose
docker-compose up -d

# Set up Nginx reverse proxy for HTTPS (required for voice)
sudo apt install nginx certbot python3-certbot-nginx
```

## Production Checklist

- [ ] HTTPS enabled (required for microphone access)
- [ ] Environment variables set correctly
- [ ] CORS configured with production URLs
- [ ] Vapi webhook URL updated if needed
- [ ] Test voice functionality
- [ ] Monitor logs for errors

## Monitoring

### Render Dashboard
- View logs in real-time
- Monitor resource usage
- Set up health checks

### Add Error Tracking (Optional)
```javascript
// In frontend/src/index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## Troubleshooting Production Issues

### Voice Not Working
1. Ensure HTTPS is enabled
2. Check browser console for errors
3. Verify Vapi credentials

### API Connection Failed
1. Check REACT_APP_API_URL is correct
2. Verify CORS settings in backend
3. Check backend logs

### High Response Times
- Render free tier has cold starts
- Upgrade to paid tier for better performance
- Or use alternative hosting

## Cost Optimization

### Free Tier Limits
- Render: 750 hours/month (enough for 1 app)
- Bandwidth: 100GB/month
- Build minutes: 500/month

### Tips to Stay Free
1. Use one service for both frontend/backend
2. Enable auto-sleep on Render
3. Use CDN for static assets

## Next Steps

1. Add a custom domain
2. Set up monitoring/alerts
3. Implement caching
4. Add a database (PostgreSQL)
5. Scale as needed