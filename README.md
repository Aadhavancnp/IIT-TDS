# LLM Code Deployment System

An automated system that receives app briefs via API, generates code using LLMs, deploys to GitHub Pages, and notifies evaluators—all within 10 minutes.

**✨ Now using Bun + AI Pipe for FREE LLM access!**

## 📚 Documentation

- **[BUN_AIPIPE_GUIDE.md](BUN_AIPIPE_GUIDE.md)** ⭐ **NEW!** - Bun & AI Pipe setup
- **[README.md](README.md)** - This file (overview & setup)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment options & guides
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture & workflow
- **[EXAMPLES.md](EXAMPLES.md)** - Sample requests & testing
- **[CHECKLIST.md](CHECKLIST.md)** - Pre-submission verification
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions

## 🚀 Quick Start

```bash
# 1. Install Bun (faster than Node.js)
curl -fsSL https://bun.sh/install | bash

# 2. Install dependencies
bun install

# 3. Configure environment (interactive)
bun run setup

# 4. Start server
bun start

# 5. Test (in another terminal)
bun test
```

## 💰 Why This is Better

### FREE AI Access

- ✅ **$2/month FREE** for study.iitm.ac.in emails
- ✅ No credit card required
- ✅ Access via [aipipe.org](https://aipipe.org)
- ✅ Perfect for course assignments

### Faster with Bun

- 🚀 3x faster package installation
- 🚀 Instant startup
- 🚀 Built-in TypeScript support
- 🚀 Native watch mode

## 🎯 Overview

This project implements an end-to-end deployment pipeline for the IIT-TDS LLM Code Deployment assignment. It:

1. **Receives** task requests via HTTP POST
2. **Verifies** student secrets
3. **Generates** complete web applications using OpenAI
4. **Creates** GitHub repositories with MIT licenses
5. **Deploys** to GitHub Pages automatically
6. **Notifies** evaluation endpoints with repo details

## 🚀 Features

- ✅ REST API endpoint for receiving task requests
- ✅ Secret verification for security
- ✅ LLM-powered code generation (OpenAI GPT-4)
- ✅ Automatic GitHub repository creation
- ✅ MIT LICENSE generation
- ✅ Professional README.md generation
- ✅ GitHub Pages deployment
- ✅ Evaluation callback with exponential backoff retry
- ✅ Support for multiple rounds per task
- ✅ Data URI attachment handling

## 📋 Prerequisites

- **Bun** runtime (faster than Node.js)
- GitHub account with Personal Access Token
- **AI Pipe token** (FREE for study.iitm.ac.in emails)
- Student secret from course registration

## 🔧 Installation

### 1. Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Or with Homebrew
brew install oven-sh/bun/bun

# Verify
bun --version
```

### 2. Clone or Setup Repository

```bash
git clone https://github.com/Aadhavancnp/IIT-TDS.git
cd IIT-TDS
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Get AI Pipe Token (FREE!)

1. Go to: **https://aipipe.org/login**
2. Login with your **study.iitm.ac.in** email
3. Copy your token
4. **You get $2/month FREE** - monitor usage!

### 5. Configure Environment

Option A - Interactive setup (Recommended):

```bash
bun run setup
```

Option B - Manual setup:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# GitHub Personal Access Token (needs: repo, workflow, pages permissions)
GITHUB_TOKEN=ghp_your_actual_token_here

# AI Pipe Token (FREE $2/month for study.iitm.ac.in)
# Get from: https://aipipe.org/login
AIPIPE_TOKEN=your_actual_token_here

# Your GitHub username
GITHUB_USERNAME=Aadhavancnp

# Your secret (from Google Form)
STUDENT_SECRET=your-secret-here

# Your student email (must be study.iitm.ac.in)
STUDENT_EMAIL=24f1002051@ds.study.iitm.ac.in

# Server port
PORT=3000
```

### 6. Get GitHub Personal Access Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `admin:repo_hook` (for GitHub Pages)
4. Generate token and copy to `.env`

## 🏃 Running the Application

### Local Development

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Test the Endpoint

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "status": "ok",
  "message": "LLM Code Deployment API",
  "email": "24f1002051@ds.study.iitm.ac.in"
}
```

## 📡 API Usage

### Endpoint: POST /api/build

Send task requests to this endpoint:

```bash
curl http://localhost:3000/api/build \
  -H "Content-Type: application/json" \
  -d '{
    "email": "24f1002051@ds.study.iitm.ac.in",
    "secret": "your-secret",
    "task": "sum-of-sales-abc12",
    "round": 1,
    "nonce": "550e8400-e29b-41d4-a716-446655440000",
    "brief": "Create a single-page site that displays the sum of sales from data.csv",
    "checks": [
      "Page loads successfully",
      "Total sales displayed in #total-sales"
    ],
    "evaluation_url": "https://exam.sanand.workers.dev/notify",
    "attachments": [
      {
        "name": "data.csv",
        "url": "data:text/csv;base64,..."
      }
    ]
  }'
```

### Response

Immediate HTTP 200 response:

```json
{
  "status": "accepted",
  "message": "Request received and processing started",
  "task": "sum-of-sales-abc12",
  "round": 1
}
```

Processing continues asynchronously:

1. Generates app code using OpenAI
2. Creates GitHub repository
3. Adds LICENSE, README.md, and generated code
4. Enables GitHub Pages
5. Notifies evaluator endpoint

## 🌐 Deployment Options

### Option 1: Local (ngrok for public URL)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Run your app
npm start

# In another terminal, expose it
ngrok http 3000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io`) as your API endpoint.

### Option 2: Cloudflare Workers

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Create `wrangler.toml`:

```toml
name = "llm-deployment"
main = "server.js"
compatibility_date = "2024-01-01"

[vars]
GITHUB_USERNAME = "Aadhavancnp"
STUDENT_EMAIL = "24f1002051@ds.study.iitm.ac.in"

[[kv_namespaces]]
binding = "TASKS"
```

3. Deploy:

```bash
wrangler publish
```

### Option 3: Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

3. Deploy:

```bash
vercel --prod
```

### Option 4: Railway / Render

1. Connect your GitHub repo to Railway or Render
2. Set environment variables in dashboard
3. Deploy automatically on push

## 📂 Project Structure

```
IIT-TDS/
├── server.js              # Main Express server
├── lib/
│   ├── validator.js       # Request validation & secret verification
│   ├── generator.js       # LLM-based app generation
│   ├── github.js          # GitHub API integration
│   └── evaluator.js       # Evaluation callback with retry
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔍 How It Works

### Request Flow

```
1. POST /api/build → Validate → Verify Secret → Return 200
                                     ↓
2. Generate App (OpenAI GPT-4o-mini)
                                     ↓
3. Create GitHub Repo → Add LICENSE → Add README → Push Code
                                     ↓
4. Enable GitHub Pages
                                     ↓
5. POST to evaluation_url with repo details
```

### Code Generation

The system uses OpenAI's GPT-4o-mini to generate complete HTML applications:

- Single-file HTML with embedded CSS/JavaScript
- Bootstrap 5 for styling (CDN)
- Implements all requirements from brief
- Includes specified IDs and classes for validation
- Handles attachments (data URIs)

### GitHub Integration

Uses Octokit to:

- Create public repositories
- Add MIT LICENSE automatically
- Generate professional README.md
- Push generated code
- Enable GitHub Pages (main branch, root path)

### Evaluation Callback

Implements robust retry logic:

- Attempts: 5 times
- Delays: 1s, 2s, 4s, 8s, 16s (exponential backoff)
- Returns success/failure status

## 🧪 Testing

### Test with Sample Request

Create `test-request.json`:

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "test-task-demo",
  "round": 1,
  "nonce": "test-nonce-123",
  "brief": "Create a simple page with Bootstrap that displays 'Hello World' in an h1 tag with id='greeting'",
  "checks": [
    "Page has Bootstrap 5 loaded",
    "H1 element with id='greeting' exists",
    "H1 contains text 'Hello World'"
  ],
  "evaluation_url": "https://httpbin.org/post",
  "attachments": []
}
```

Send it:

```bash
curl http://localhost:3000/api/build \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

## 🐛 Troubleshooting

### "Invalid secret" error

- Check that `STUDENT_SECRET` in `.env` matches your form submission
- Ensure no extra whitespace in the secret

### GitHub Pages not deploying

- Wait 2-3 minutes after creation
- Check repository settings → Pages
- Verify `GITHUB_TOKEN` has required permissions

### OpenAI API errors

- Check `OPENAI_API_KEY` is valid
- Verify you have API credits
- Check rate limits

### Repository creation fails

- Verify `GITHUB_TOKEN` has `repo` scope
- Check `GITHUB_USERNAME` is correct
- Ensure repo name doesn't conflict

## 📊 Logs

The application provides detailed console logging:

```
=== Received Build Request ===
Email: 24f1002051@ds.study.iitm.ac.in
Task: test-task-demo
Round: 1

=== Starting App Generation ===
Generating app with OpenAI...
✓ App generated successfully

=== Creating GitHub Repository ===
Creating repository: test-task-demo-r1
✓ Repository created: https://github.com/...
✓ LICENSE added
✓ README.md added
✓ index.html added
✓ GitHub Pages enabled

=== Notifying Evaluator ===
✓ Evaluator notified successfully

=== Process Complete ===
```

## 🔐 Security Notes

- Never commit `.env` file
- Keep GitHub token secure
- Use environment variables for secrets
- Validate all incoming requests
- Use HTTPS in production

## 📝 License

MIT License - see generated repositories for full license text.

## 🤝 Contributing

This is a course assignment project. Not accepting external contributions.

## 📧 Contact

- Email: 24f1002051@ds.study.iitm.ac.in
- GitHub: [@Aadhavancnp](https://github.com/Aadhavancnp)

## 🎓 Course Information

**IIT Madras - Tools in Data Science**  
Project: LLM Code Deployment  
Year: 2025

---

_Built with ❤️ using Node.js, OpenAI, and GitHub APIs_
