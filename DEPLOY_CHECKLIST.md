# ✅ Render Deployment Checklist

## Before You Deploy

- [x] Code pushed to GitHub
- [x] Server configured to run on Render (not just Vercel)
- [x] Puppeteer added as production dependency
- [x] Start command set to `node server.js`
- [ ] Get your LLM API key from https://aipipe.org

## Deployment Steps

### 1. Go to Render.com
Visit: https://render.com

### 2. Create New Web Service
- Click "New +" button
- Select "Web Service"
- Connect GitHub: `Aadhavancnp/IIT-TDS`

### 3. Configuration
```
Name: iit-tds-quiz-solver
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 4. Environment Variables (IMPORTANT!)
Add these in the "Environment" section:

```
STUDENT_EMAIL=24f1002051@ds.study.iitm.ac.in
STUDENT_SECRET=GciOiJIUzI1NiJ3d3d
LLM_API_KEY=[GET FROM AIPIPE.ORG]
LLM_API_URL=https://aipipe.org/openrouter/v1
LLM_MODEL=openai/gpt-4o-mini
PORT=3000
```

### 5. Deploy
- Click "Create Web Service"
- Wait 3-5 minutes for first deployment
- Render will install Puppeteer & Chromium

## After Deployment

### Test Health Check
```bash
curl https://your-app-name.onrender.com/
```

Should return:
```json
{
  "status": "ok",
  "message": "LLM Analysis Quiz Solver",
  "email": "24f1002051@ds.study.iitm.ac.in",
  "timestamp": "..."
}
```

### Test Quiz Solving
```bash
curl -X POST https://your-app-name.onrender.com/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "24f1002051@ds.study.iitm.ac.in",
    "secret": "GciOiJIUzI1NiJ3d3d",
    "url": "https://exam.sanand.workers.dev/demo"
  }'
```

Should return:
```json
{
  "status": "accepted",
  "message": "Quiz solved and submitted successfully",
  "quiz_id": "...",
  "submission_time": "..."
}
```

## Submit to Course

Once working, submit this URL to the course form:
```
https://your-app-name.onrender.com/api/solve
```

## Troubleshooting

**Logs showing errors?**
- Check Environment Variables are set correctly
- Verify LLM_API_KEY is valid
- Check Render logs for specific error messages

**Service sleeping?**
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Keep-alive not needed for assignment submission

**Want to test locally first?**
```bash
npm install
npm start
```

Then test on http://localhost:3000
