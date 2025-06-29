# Deployment Guide for PlacementPal

This guide will help you deploy your PlacementPal application to a public host.

## Prerequisites

1. **Database**: You need a PostgreSQL database. We recommend using [Neon](https://neon.tech) for serverless PostgreSQL.
2. **Gmail API**: For email integration, you'll need to set up Gmail API credentials.

## Option 1: Deploy to Railway (Recommended)

### Step 1: Set up Railway
1. Go to [Railway](https://railway.app) and create an account
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### Step 2: Initialize Railway Project
```bash
cd PlacementPal
railway init
```

### Step 3: Add PostgreSQL Database
1. In Railway dashboard, click "New Project"
2. Select "Provision PostgreSQL"
3. Copy the `DATABASE_URL` from the database service

### Step 4: Set Environment Variables
In Railway dashboard, go to your app service and add these environment variables:

```
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=your-random-session-secret
NODE_ENV=production
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=https://your-railway-domain.railway.app/auth/gmail/callback
```

### Step 5: Deploy
```bash
railway up
```

## Option 2: Deploy to Render

### Step 1: Set up Render
1. Go to [Render](https://render.com) and create an account
2. Connect your GitHub repository

### Step 2: Create Web Service
1. Click "New Web Service"
2. Connect your repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

### Step 3: Add PostgreSQL Database
1. Create a new PostgreSQL service
2. Copy the connection string to your environment variables

### Step 4: Set Environment Variables
Add the same environment variables as listed above.

## Option 3: Deploy to Vercel (Frontend) + Railway (Backend)

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import your repository
3. Set build command: `npm run build:client`
4. Set output directory: `dist/public`

### Backend (Railway)
1. Deploy the backend to Railway as described above
2. Update the frontend API calls to point to your Railway backend URL

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random string for session encryption
- `NODE_ENV`: Set to "production"

### Optional (for Gmail integration)
- `GMAIL_CLIENT_ID`: Your Gmail API client ID
- `GMAIL_CLIENT_SECRET`: Your Gmail API client secret
- `GMAIL_REDIRECT_URI`: Your app's Gmail callback URL

## Database Setup

### Using Neon (Recommended)
1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Run database migrations:
```bash
npm run db:push
```

### Using Railway PostgreSQL
1. Railway automatically runs migrations on deployment
2. You can also run manually: `railway run npm run db:push`

## Gmail API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized redirect URIs
6. Copy Client ID and Client Secret to environment variables

## Custom Domain (Optional)

### Railway
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain and follow DNS instructions

### Render
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain and configure DNS

## Monitoring and Logs

### Railway
```bash
railway logs
railway status
```

### Render
- View logs in the dashboard
- Set up alerts for downtime

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Ensure database is accessible from your deployment platform

2. **Build Fails**
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`

3. **Gmail Integration Not Working**
   - Verify OAuth credentials
   - Check redirect URI matches exactly
   - Ensure Gmail API is enabled

4. **Static Files Not Serving**
   - Check if `dist/public` directory exists after build
   - Verify static file serving configuration

### Support
- Check the logs: `railway logs` or dashboard logs
- Verify environment variables are set correctly
- Test database connection locally first 