# Deployment Guide

This guide covers deploying the AI Real Estate Marketplace using various open source and free hosting platforms.

## Prerequisites

1. Git repository with your code
2. Vapi.ai API credentials
3. Domain name (optional)

## Deployment Options

### 1. Docker Deployment (Self-Hosted)

Perfect for VPS, dedicated servers, or local deployment.

```bash
# Clone the repository
git clone <your-repo-url>
cd hackathon-final

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your actual values

# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

**Pros:** Full control, easy scaling, consistent environments
**Cons:** Requires server management

### 2. Render (Recommended for Beginners)

Free tier available with automatic HTTPS.

1. Fork/push code to GitHub
2. Sign up at [render.com](https://render.com)
3. Create New → Web Service (for backend)
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Add environment variables
4. Create New → Static Site (for frontend)
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Add environment variables

**Pros:** Free tier, automatic deploys, simple setup
**Cons:** Cold starts on free tier

### 3. Railway

Modern platform with great developer experience.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up

# Add environment variables
railway variables set VAPI_API_KEY=your_key
railway variables set REACT_APP_VAPI_PUBLIC_KEY=your_key
```

**Pros:** Fast deploys, good free tier, great UI
**Cons:** Limited free hours

### 4. Fly.io

Distributed deployment with global edge locations.

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and create app
fly auth login
fly apps create real-estate-voice-app

# Deploy backend
cd backend
fly deploy

# Set secrets
fly secrets set VAPI_API_KEY=your_key
```

Deploy frontend separately on Netlify/Vercel.

**Pros:** Global distribution, generous free tier
**Cons:** Slightly complex setup

### 5. Netlify + External Backend

Best for separating frontend and backend.

**Frontend on Netlify:**
1. Connect GitHub repo
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
3. Add environment variables in Netlify UI

**Backend Options:**
- Render.com (free)
- Railway (free tier)
- Fly.io (free tier)
- Your own VPS

### 6. DigitalOcean App Platform

```bash
# Using doctl CLI
doctl apps create --spec .do/app.yaml

# Or use the web interface
# 1. Create new app
# 2. Connect GitHub
# 3. Configure components (backend + frontend)
# 4. Add environment variables
```

**Pros:** Reliable, good scaling options
**Cons:** No permanent free tier

## Environment Variables

### Backend (.env)
```env
PORT=3001
VAPI_API_KEY=your_vapi_api_key
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend Build Variables
```env
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_VAPI_PUBLIC_KEY=your_vapi_public_key
REACT_APP_VAPI_ASSISTANT_ID=your_assistant_id
```

## Post-Deployment Steps

1. **Test Voice Functionality**
   - Ensure HTTPS is enabled (required for microphone access)
   - Test Vapi connection
   - Verify API calls work

2. **Configure CORS**
   - Update `FRONTEND_URL` in backend
   - Ensure proper headers are set

3. **Monitor Performance**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Check Vapi usage/costs

4. **Security Checklist**
   - ✅ HTTPS enabled
   - ✅ Environment variables secure
   - ✅ CORS properly configured
   - ✅ API keys not exposed
   - ✅ Rate limiting enabled (optional)

## Troubleshooting

### Voice Not Working
- Check HTTPS is enabled
- Verify Vapi credentials
- Check browser console for errors

### CORS Errors
- Update `FRONTEND_URL` in backend
- Check API URL in frontend

### 502/503 Errors
- Check backend logs
- Verify environment variables
- Ensure sufficient memory

## Cost Optimization

1. **Free Tier Limits:**
   - Render: 750 hours/month
   - Railway: $5 credit/month
   - Fly.io: 3 shared VMs
   - Netlify: 100GB bandwidth

2. **Tips:**
   - Use CDN for static assets
   - Enable caching headers
   - Optimize images
   - Minimize API calls

## Scaling Considerations

When your app grows:

1. **Database:** Add PostgreSQL with pgvector
2. **Caching:** Add Redis for search results
3. **CDN:** Use Cloudflare for global distribution
4. **Monitoring:** Add APM tools
5. **Load Balancing:** Use multiple instances

## Quick Deploy Scripts

### Deploy to Render
```bash
#!/bin/bash
# deploy-render.sh
render create backend --type web --env node --region oregon
render create frontend --type static --env static --region oregon
render env set VAPI_API_KEY=$VAPI_API_KEY --service backend
render env set REACT_APP_API_URL=https://backend.onrender.com --service frontend
```

### Deploy with Docker
```bash
#!/bin/bash
# deploy-docker.sh
docker-compose build
docker-compose up -d
docker-compose logs -f
```

## Support

- Check deployment logs first
- Verify all environment variables
- Test locally with production build
- Join platform-specific communities for help