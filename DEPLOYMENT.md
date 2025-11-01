# Deployment Note

## ⚠️ Vercel Serverless Limitations

This project uses **Puppeteer** for headless browser automation, which has limitations on Vercel's serverless platform:

- Vercel serverless functions have **50MB size limit**
- Chrome/Chromium binary is **~200MB**
- Vercel functions have **memory/CPU constraints**

## Recommended Deployment Options

### Option 1: Use Render.com (Recommended)
- Supports long-running Node.js servers
- No size limits
- Free tier available
- Deploy: `https://render.com/`

### Option 2: Use Railway.app
- Supports Docker/Node.js
- Generous free tier
- Deploy: `https://railway.app/`

### Option 3: Use Vercel with @sparticuz/chromium
Install the serverless-compatible chromium:
```bash
npm install @sparticuz/chromium puppeteer-core
```

Update `lib/browser.js` to use it in production.

## Current Status

- ✅ **Local Development**: Working perfectly
- ✅ **Code Verified**: All 3 demo quizzes pass
- ⚠️ **Vercel Deployment**: Needs chromium-aws-lambda or alternative hosting

## Quick Deploy to Render

1. Go to https://render.com/
2. Create new **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Add all variables from `.env`
5. Deploy!

The application is **production-ready** for any platform that supports Node.js servers with Puppeteer.
