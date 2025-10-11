# Next Steps - Getting Started Guide

Follow these steps in order to set up and deploy your LLM Code Deployment system.

## 📋 Phase 1: Initial Setup (15 minutes)

### Step 1: Install Bun Runtime

```bash
# Install Bun (fast JavaScript runtime)
curl -fsSL https://bun.sh/install | bash

# Restart terminal or run:
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Verify installation
bun --version
```

**Expected output**: `1.x.x` (or latest version)

### Step 2: Install Dependencies

```bash
cd /Users/aadhavanp/Developer/IIT-TDS
bun install
```

**Expected output**: All packages installed (3x faster than npm!)

### Step 3: Get GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "LLM-Deployment-Token"
4. Select scopes:
   - ✅ `repo` (Full control)
   - ✅ `workflow`
   - ✅ `admin:repo_hook`
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 4: Get AI Pipe Token (FREE!)

1. Go to: https://aipipe.org/login
2. Click "Sign in with Google"
3. Use your email: `24f1002051@ds.study.iitm.ac.in`
4. **Copy your token** from the dashboard
5. **FREE $2/month** included - no credit card needed!

**Important**: Monitor usage at https://aipipe.org/usage to stay under $2/month

### Step 5: Configure Environment

```bash
bun run setup
```

When prompted, enter:

- **GitHub Token**: (paste from Step 3)
- **AI Pipe Token**: (paste from Step 4)
- **GitHub Username**: `Aadhavancnp`
- **Student Email**: `24f1002051@ds.study.iitm.ac.in`
- **Student Secret**: (the secret you submitted in Google Form)
- **Port**: `3000` (or press Enter for default)

**Verify**: Check that `.env` file was created

---

## 🧪 Phase 2: Local Testing (10 minutes)

### Step 6: Start the Server

```bash
bun start
```

**Expected output**:

```
🚀 Server running on http://localhost:3000
📧 Configured for: 24f1002051@ds.study.iitm.ac.in
👤 GitHub user: Aadhavancnp
⚡ Running on Bun v1.x.x
```

### Step 7: Test Health Check

In a **new terminal**:

```bash
curl http://localhost:3000/
```

**Expected response**:

```json
{
  "status": "ok",
  "message": "LLM Code Deployment API",
  "email": "24f1002051@ds.study.iitm.ac.in"
}
```

### Step 8: Update Test Request

Edit `test-request.json`:

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "YOUR-ACTUAL-SECRET",
  ...
}
```

### Step 9: Run Test

```bash
bun test
```

**Expected output**:

```
✅ Test passed! Request accepted.
⏰ Processing will continue asynchronously.
```

### Step 10: Monitor Logs

Watch the first terminal (where server is running) for:

```
=== Received Build Request ===
=== Starting App Generation ===
=== Creating GitHub Repository ===
=== Notifying Evaluator ===
=== Process Complete ===
```

### Step 11: Verify Results

1. Check your GitHub account
2. Look for new repo: `test-task-demo-r1` (or similar)
3. Verify it has:
   - LICENSE file
   - README.md
   - index.html
4. Wait 2-3 minutes, then visit Pages URL
5. Verify app loads in browser

**If all tests pass**: ✅ Ready for deployment!

---

## 🚀 Phase 3: Deployment (20 minutes)

### Option A: Quick Deploy with ngrok (Recommended for Testing)

#### Step 12: Install ngrok

```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

#### Step 13: Expose Server

```bash
# Make sure server is running (bun start)
# In new terminal:
ngrok http 3000
```

**You'll see**:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### Step 14: Test Public URL

```bash
curl https://abc123.ngrok.io/
```

**If works**: ✅ Your endpoint is: `https://abc123.ngrok.io/api/build`

---

### Option B: Deploy to Vercel (Recommended for Production)

#### Step 12: Install Vercel CLI

```bash
# Using npm (Vercel CLI doesn't support Bun directly yet)
npm i -g vercel
```

#### Step 13: Deploy

```bash
vercel
```

Follow prompts:

- Set up and deploy? **Y**
- Which scope? (choose your account)
- Link to existing project? **N**
- What's your project name? `llm-deployment`
- In which directory is your code? `./`
- Want to override settings? **N**

#### Step 14: Disable Vercel Protection

**CRITICAL**: The course evaluator needs access without authentication!

Go to: https://vercel.com/dashboard → Your Project → Settings → Deployment Protection

**Set to**: "Standard Protection" with "Bypass for Automation" enabled

OR disable protection entirely for course purposes.

#### Step 15: Add Secrets

```bash
vercel env add GITHUB_TOKEN
# Paste your GitHub token when prompted

vercel env add AIPIPE_TOKEN
# Paste your AI Pipe token when prompted

vercel env add STUDENT_SECRET
# Paste your secret when prompted

vercel env add GITHUB_USERNAME
vercel env add STUDENT_EMAIL
```

#### Step 16: Redeploy

```bash
vercel --prod
```

**You'll get**: `https://llm-deployment-xxx.vercel.app`

#### Step 17: Test Production

```bash
curl https://llm-deployment-xxx.vercel.app/
```

**If works**: ✅ Your endpoint is: `https://llm-deployment-xxx.vercel.app/api/build`

---

## 📝 Phase 4: Submission (5 minutes)

### Step 18: Final Verification

Use CHECKLIST.md to verify:

- [ ] Server responds within 1 second
- [ ] Test request creates repo
- [ ] GitHub Pages deploys
- [ ] Evaluation callback sent
- [ ] Logs show no errors
- [ ] **Vercel protection disabled** (if using Vercel)
- [ ] Public URL returns JSON, not authentication page

### Step 19: Submit to Course

Go to the Google Form and submit:

- **API Endpoint**: Your public URL + `/api/build`
  - ngrok: `https://abc123.ngrok.io/api/build`
  - Vercel: `https://your-app.vercel.app/api/build`
- **Student Email**: `24f1002051@ds.study.iitm.ac.in`
- **Secret**: (your secret)
- **GitHub Username**: `Aadhavancnp`

**⚠️ Important**: If using Vercel, make sure authentication is disabled!

### Step 20: Keep Server Running

**If using ngrok**:

- Keep your computer on
- Keep `bun start` running
- Keep `ngrok` running
- Don't close terminals

**If using Vercel**:

- Nothing needed (automatically running)
- Check dashboard for logs

---

## 🔍 Phase 5: Monitoring (Ongoing)

### Step 21: Monitor Requests

**ngrok**: Watch terminal with `bun start`

**Vercel**:

```bash
vercel logs --follow
```

**AI Pipe**: Monitor usage at https://aipipe.org/usage (stay under $2/month!)

### Step 22: Check for Issues

Watch for:

- Request reception
- Successful repo creation
- Pages deployment
- Evaluation callbacks
- AI Pipe usage limits

### Step 23: Handle Round 2

When you receive a Round 2 request:

- No action needed (automatic)
- Verify existing repo gets updated
- Check logs for "round": 2

---

## 🆘 Troubleshooting

### Server won't start

→ Check TROUBLESHOOTING.md → "Server Issues"

### Invalid secret error

→ Verify `.env` has correct secret
→ Check no extra spaces

### GitHub API fails

→ Verify token is valid
→ Check permissions

### AI Pipe errors

→ **401 Unauthorized**: Token incorrect, get new one at https://aipipe.org/login
→ **429 Too Many Requests**: Exceeded $2/month, check usage at https://aipipe.org/usage
→ **503 Service Unavailable**: AI Pipe temporarily down, wait and retry

### Vercel shows authentication page

→ **Disable protection**: Vercel Dashboard → Settings → Deployment Protection
→ Test with: `curl your-url.vercel.app/` (should return JSON, not HTML)

### Pages won't deploy

→ Wait 2-3 minutes
→ Check repo Settings → Pages

**For more help**: See TROUBLESHOOTING.md

---

## 📚 Reference Documentation

After setup, refer to these as needed:

- **README.md** - Main documentation
- **DEPLOYMENT.md** - Detailed deployment options
- **ARCHITECTURE.md** - How system works
- **EXAMPLES.md** - Sample requests
- **CHECKLIST.md** - Pre-submission verification
- **TROUBLESHOOTING.md** - Problem solving
- **DIAGRAMS.md** - Visual guides

---

## ✅ Success Checklist

Before considering yourself done:

- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Server starts without errors
- [ ] Health check works
- [ ] Test request succeeds
- [ ] Repository created on GitHub
- [ ] LICENSE file present
- [ ] README.md professional
- [ ] GitHub Pages deployed
- [ ] App loads in browser
- [ ] Deployed to public URL
- [ ] Public URL tested
- [ ] Submitted to course
- [ ] Server/service running
- [ ] Monitoring in place

---

## 💡 Tips

### Development

- Use `bun run dev` for auto-reload during development (faster than Node.js!)
- Test with httpbin.org before real evaluation
- Keep logs for debugging

### Testing

- Test Round 1 thoroughly first
- Test Round 2 with same task ID
- Verify repo gets updated (not new repo)

### Deployment

- ngrok is fastest for testing
- Vercel is best for production (but **disable authentication!**)
- Keep secrets secure
- Monitor AI Pipe usage (FREE $2/month included!)

### Operation

- Check logs regularly
- Monitor GitHub rate limits
- Monitor AI Pipe usage at https://aipipe.org/usage
- Stay under $2/month free limit
- Have backup tokens ready

---

## 🎯 Timeline

| Phase         | Time        | Status |
| ------------- | ----------- | ------ |
| Initial Setup | 15 min      | ⬜     |
| Local Testing | 10 min      | ⬜     |
| Deployment    | 20 min      | ⬜     |
| Submission    | 5 min       | ⬜     |
| **Total**     | **~50 min** |        |

---

## 🎓 Ready to Start?

1. Open terminal
2. Navigate to project directory
3. Follow Phase 1, Step 1
4. Work through each phase in order
5. Don't skip steps!

---

**Questions? Issues?**

- Check TROUBLESHOOTING.md first
- Review relevant documentation
- Contact instructors if stuck

**Good luck! 🚀**

---

**Start here**:

```bash
# Install Bun first
curl -fsSL https://bun.sh/install | bash

# Then proceed
cd /Users/aadhavanp/Developer/IIT-TDS
bun install
```
