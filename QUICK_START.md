# Quick Start Deployment Guide

Your PlacementPal application is ready for deployment! Here's the fastest way to get it live:

## 🚀 Quick Deploy to Railway (5 minutes)

### 1. Set up Railway
```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy
```bash
cd PlacementPal
railway init
railway up
```

### 3. Add Database
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the `DATABASE_URL` from the database service
4. Add it to your app's environment variables

### 4. Set Environment Variables
In Railway dashboard, add these to your app service:
```
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=your-random-secret-key
NODE_ENV=production
```

### 5. Run Database Migration
```bash
railway run npm run db:push
```

## 🌐 Your App is Live!

Your app will be available at: `https://your-app-name.railway.app`

## 📧 Optional: Add Gmail Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable Gmail API
3. Create OAuth 2.0 credentials
4. Add these environment variables:
```
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=https://your-app-name.railway.app/auth/gmail/callback
```

## 🔧 Alternative Platforms

### Render
1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Use the `render.yaml` file for automatic setup

### Vercel (Frontend) + Railway (Backend)
1. Deploy backend to Railway (above)
2. Deploy frontend to Vercel with build command: `npm run build:client`

## 📖 Need More Details?

See `DEPLOYMENT.md` for comprehensive instructions and troubleshooting. 