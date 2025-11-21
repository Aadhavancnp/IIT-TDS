# Deployment Guide

## ⚠️ Vercel Deployment Issues

This application uses Puppeteer for headless browser automation, which has proven **incompatible with Vercel's serverless platform** despite following their official documentation.

### Issues Encountered:

- ❌ FUNCTION_INVOCATION_FAILED errors persist
- ❌ @sparticuz/chromium still exceeds Vercel's limits
- ❌ Cold starts timeout (300s limit insufficient for quiz solving)
- ❌ Serverless architecture unsuitable for long-running browser operations

## ✅ Recommended: Deploy to Render.com

Render.com provides a better environment for Puppeteer applications with:

- ✅ Full Docker container support
- ✅ No bundle size limits
- ✅ Standard Puppeteer works without modifications
- ✅ Free tier available
- ✅ Persistent browser processes

### Quick Deploy to Render:

1. **Connect Repository**:

   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Aadhavancnp/IIT-TDS`

2. **Configure Service**:

   ```
   Name: iit-tds-quiz-solver
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Add Environment Variables**:

   ```
   STUDENT_EMAIL=24f1002051@ds.study.iitm.ac.in
   STUDENT_SECRET=GciOiJIUzI1NiJ3d3d
   LLM_API_KEY=[your-key]
   LLM_API_URL=https://aipipe.org/openrouter/v1
   LLM_MODEL=openai/gpt-4o-mini
   PORT=3000
   ```

4. **Deploy**: Click "Create Web Service"

Your API will be available at: `https://iit-tds-quiz-solver.onrender.com/api/solve`

## Alternative: Railway.app

Railway is another excellent option:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

## Local Testing

The application works perfectly locally:

```bash
bun install
bun run server.js
```

All 3 demo quizzes pass successfully with a 56-second total completion time.
