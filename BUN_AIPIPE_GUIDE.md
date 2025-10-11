# Updated Installation Guide - Using Bun & AI Pipe

## 🎉 Major Updates

1. **Bun Runtime** - Faster than Node.js, built-in TypeScript support
2. **AI Pipe Integration** - **FREE $2/month** for study.iitm.ac.in emails
3. **No OpenAI costs** - Use the course-provided AI Pipe service

---

## 🚀 Quick Start

### Step 1: Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Or with Homebrew
brew install oven-sh/bun/bun

# Verify installation
bun --version
```

### Step 2: Install Dependencies

```bash
cd /Users/aadhavanp/Developer/IIT-TDS
bun install
```

### Step 3: Get AI Pipe Token (FREE!)

1. Go to: **https://aipipe.org/login**
2. Login with your **study.iitm.ac.in** email
3. Copy your token from the dashboard
4. **Important**: You get $2/month FREE - don't exceed it!

### Step 4: Configure Environment

```bash
bun run setup
```

Enter:

- **GitHub Token**: From https://github.com/settings/tokens
- **AI Pipe Token**: From https://aipipe.org/login
- **GitHub Username**: `Aadhavancnp`
- **Student Email**: `24f1002051@ds.study.iitm.ac.in`
- **Student Secret**: Your secret from Google Form
- **Port**: `3000` (or press Enter)

### Step 5: Start Server

```bash
bun start
```

### Step 6: Test

```bash
# In another terminal
bun test
```

---

## 💰 Cost Comparison

| Service       | Old (OpenAI Direct)          | New (AI Pipe)                  |
| ------------- | ---------------------------- | ------------------------------ |
| API Access    | Requires paid OpenAI account | **FREE** with study.iitm.ac.in |
| Monthly Limit | Pay-as-you-go                | **$2 FREE** per month          |
| Setup         | Complex API key              | Simple token from aipipe.org   |
| Perfect For   | Production                   | **Course assignments**         |

---

## 🔑 AI Pipe Benefits

### Free Access

- ✅ $2 per month FREE for IIT-M students
- ✅ No credit card required
- ✅ Access to GPT-4o-mini and other models
- ✅ Powered by OpenRouter

### Easy Setup

1. Login with study.iitm.ac.in email
2. Get token instantly
3. Start using immediately

### Monitor Usage

- Check usage at: https://aipipe.org/usage
- Stay under $2/month limit
- Resets every calendar month

---

## ⚠️ Important Warnings

### DO NOT Exceed $2/Month

- Monitor usage regularly
- Test responsibly
- Don't make excessive requests
- Consider batch testing

### Email Requirement

- **MUST use** `study.iitm.ac.in` email
- Other emails won't get free access
- Verify email is correct

---

## 🔄 Migration from Node.js

If you were using the old Node.js version:

### 1. Install Bun

```bash
brew install oven-sh/bun/bun
```

### 2. Update .env

```bash
# Remove
OPENAI_API_KEY=...

# Add
AIPIPE_TOKEN=your-aipipe-token
```

### 3. Reinstall Dependencies

```bash
rm -rf node_modules package-lock.json
bun install
```

### 4. Start with Bun

```bash
bun start
```

---

## 📊 Performance Comparison

| Metric          | Node.js      | Bun           |
| --------------- | ------------ | ------------- |
| Startup Time    | ~500ms       | ~50ms         |
| Memory Usage    | Higher       | Lower         |
| Package Install | Slower       | **3x faster** |
| Hot Reload      | node --watch | Built-in      |
| TypeScript      | Needs setup  | Native        |

---

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/
```

### Full Test

```bash
# Edit test-request.json first
bun test
```

### Monitor Usage

```bash
# Check your AI Pipe usage
# Visit: https://aipipe.org/usage
```

---

## 🚀 Deployment

### Option 1: ngrok (Recommended for Testing)

```bash
brew install ngrok
bun start  # Terminal 1
ngrok http 3000  # Terminal 2
```

### Option 2: Railway (Bun Support)

1. Push to GitHub
2. Connect to Railway
3. Set environment variables:
   - `GITHUB_TOKEN`
   - `AIPIPE_TOKEN`
   - `STUDENT_SECRET`
   - `GITHUB_USERNAME`
   - `STUDENT_EMAIL`
4. Railway auto-detects Bun

### Option 3: Vercel (Node.js Compatibility)

```bash
npm i -g vercel
vercel
vercel env add AIPIPE_TOKEN
vercel env add GITHUB_TOKEN
vercel env add STUDENT_SECRET
vercel --prod
```

---

## 🔧 Troubleshooting

### Bun not found

```bash
# Reinstall Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

### AI Pipe 401 Error

- Check token is correct
- Verify email is study.iitm.ac.in
- Login again at https://aipipe.org/login

### AI Pipe 429 Rate Limit

- You've exceeded $2/month limit
- Wait until next calendar month
- Or contact instructors

### Module not found

```bash
bun install
```

---

## 📝 Updated Commands

All commands now use `bun` instead of `npm/node`:

| Old Command     | New Command     |
| --------------- | --------------- |
| `npm install`   | `bun install`   |
| `npm start`     | `bun start`     |
| `npm run dev`   | `bun run dev`   |
| `npm run setup` | `bun run setup` |
| `npm test`      | `bun test`      |

---

## 🔐 Environment Variables

Updated `.env` format:

```env
# GitHub
GITHUB_TOKEN=ghp_...
GITHUB_USERNAME=Aadhavancnp

# AI Pipe (FREE!)
AIPIPE_TOKEN=your-token-from-aipipe.org

# Student Info
STUDENT_EMAIL=24f1002051@ds.study.iitm.ac.in
STUDENT_SECRET=your-secret

# Server
PORT=3000
```

---

## 📚 Documentation Updates

All documentation has been updated:

- ✅ README.md - Main guide
- ✅ GETTING_STARTED.md - Setup instructions
- ✅ DEPLOYMENT.md - Deployment options
- ✅ .env.example - Environment template
- ✅ package.json - Bun scripts

---

## ✨ Advantages

### Speed

- 🚀 Faster startup
- 🚀 Faster package install
- 🚀 Built-in watch mode

### Cost

- 💰 **FREE** API access
- 💰 $2/month included
- 💰 No credit card needed

### Developer Experience

- 🎯 Native TypeScript
- 🎯 Better error messages
- 🎯 Modern JavaScript

---

## 📞 Support

### AI Pipe Issues

- Documentation: https://aipipe.org/
- Check usage: https://aipipe.org/usage
- Contact: Course instructors

### Bun Issues

- Documentation: https://bun.sh/docs
- GitHub: https://github.com/oven-sh/bun

---

## ✅ Verification Checklist

Before submission:

- [ ] Bun installed (`bun --version`)
- [ ] Dependencies installed (`bun install`)
- [ ] AI Pipe token obtained
- [ ] `.env` configured correctly
- [ ] Server starts (`bun start`)
- [ ] Health check works
- [ ] Test request succeeds
- [ ] Repository created
- [ ] GitHub Pages deployed
- [ ] Under $2/month usage

---

**Start Here**:

```bash
curl -fsSL https://bun.sh/install | bash
cd /Users/aadhavanp/Developer/IIT-TDS
bun install
bun run setup
bun start
```

🎉 **Enjoy FREE LLM access!**
