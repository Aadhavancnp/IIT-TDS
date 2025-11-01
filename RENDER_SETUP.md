# 🚀 Render Deployment Guide

## Quick Setup (5 minutes)

### 1. Create Render Account
Go to https://render.com and sign up (free tier available)

### 2. Deploy from GitHub

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account
3. Select repository: `Aadhavancnp/IIT-TDS`
4. Configure:
   - **Name**: `iit-tds-quiz-solver` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Add Environment Variables

In the Render dashboard, go to **Environment** tab and add:

```
STUDENT_EMAIL=24f1002051@ds.study.iitm.ac.in
STUDENT_SECRET=GciOiJIUzI1NiJ3d3d
LLM_API_KEY=your-api-key-here
LLM_API_URL=https://aipipe.org/openrouter/v1
LLM_MODEL=openai/gpt-4o-mini
PORT=3000
```

**Note**: Get your LLM_API_KEY from https://aipipe.org

### 4. Deploy

Click **"Create Web Service"** - Render will:
- Install dependencies (including Puppeteer)
- Build the application
- Start the server
- Provide you with a public URL

### 5. Test Your Deployment

Your API will be at: `https://your-app-name.onrender.com`

Test health endpoint:
```bash
curl https://your-app-name.onrender.com/
```

Test quiz solving:
```bash
curl -X POST https://your-app-name.onrender.com/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "24f1002051@ds.study.iitm.ac.in",
    "secret": "GciOiJIUzI1NiJ3d3d",
    "url": "https://exam.sanand.workers.dev/demo"
  }'
```

## Why Render?

✅ **Full Puppeteer Support** - No bundle size limits  
✅ **Persistent Containers** - Not serverless, so long operations work  
✅ **Free Tier** - 750 hours/month free  
✅ **Auto-Deploy** - Push to GitHub = automatic deployment  
✅ **Simple Setup** - No Docker knowledge needed  

## Troubleshooting

**Service takes time to start?**  
- First cold start can take 2-3 minutes while Puppeteer downloads Chromium
- After that, it stays warm

**Out of memory?**  
- Upgrade to paid tier ($7/month) for more RAM
- Free tier has 512MB RAM (usually sufficient)

**Need to see logs?**  
- Go to Render dashboard → Your service → Logs tab
- Real-time logging available

## Alternative: Railway

If you prefer Railway.app:

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Then add the same environment variables in Railway dashboard.
