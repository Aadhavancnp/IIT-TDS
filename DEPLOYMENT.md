# Deployment Guide

## Quick Start (Recommended: ngrok)

The fastest way to get started is using ngrok to expose your local server:

### 1. Setup

```bash
# Install dependencies
npm install

# Configure environment
npm run setup
# Or manually: cp .env.example .env && edit .env
```

### 2. Run Server Locally

```bash
npm start
```

Server runs at `http://localhost:3000`

### 3. Expose with ngrok

```bash
# Install ngrok (macOS)
brew install ngrok

# Expose port 3000
ngrok http 3000
```

You'll get a public URL like: `https://abc123.ngrok.io`

### 4. Submit to Course

Use the ngrok URL as your API endpoint:

- **API Endpoint**: `https://abc123.ngrok.io/api/build`

---

## Production Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Free, automatic HTTPS, easy deployment
**Cons**: Cold starts on free tier

#### Steps:

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }],
  "env": {
    "GITHUB_TOKEN": "@github_token",
    "OPENAI_API_KEY": "@openai_api_key",
    "GITHUB_USERNAME": "@github_username",
    "STUDENT_SECRET": "@student_secret",
    "STUDENT_EMAIL": "@student_email"
  }
}
```

3. Deploy:

```bash
vercel
```

4. Add secrets:

```bash
vercel env add GITHUB_TOKEN
vercel env add OPENAI_API_KEY
vercel env add STUDENT_SECRET
```

5. Redeploy:

```bash
vercel --prod
```

Your URL: `https://your-project.vercel.app`

---

### Option 2: Railway

**Pros**: Free $5 credit, good for APIs, easy setup
**Cons**: Requires credit card

#### Steps:

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select this repository
5. Add environment variables in dashboard:
   - `GITHUB_TOKEN`
   - `OPENAI_API_KEY`
   - `GITHUB_USERNAME`
   - `STUDENT_SECRET`
   - `STUDENT_EMAIL`
   - `PORT` (Railway auto-sets this)
6. Deploy automatically

Your URL: `https://your-app.railway.app`

---

### Option 3: Render

**Pros**: Free tier available, simple setup
**Cons**: Slower cold starts

#### Steps:

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `GITHUB_TOKEN`
   - `OPENAI_API_KEY`
   - `GITHUB_USERNAME`
   - `STUDENT_SECRET`
   - `STUDENT_EMAIL`
6. Create Web Service

Your URL: `https://your-app.onrender.com`

---

### Option 4: Cloudflare Workers

**Pros**: Edge deployment, very fast, generous free tier
**Cons**: Requires code adaptation

#### Steps:

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Login:

```bash
wrangler login
```

3. Create `wrangler.toml`:

```toml
name = "llm-deployment"
main = "server.js"
compatibility_date = "2024-01-01"

[vars]
GITHUB_USERNAME = "your-username"
STUDENT_EMAIL = "your-email@example.com"

# Use secrets for sensitive data
```

4. Add secrets:

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put OPENAI_API_KEY
wrangler secret put STUDENT_SECRET
```

5. Deploy:

```bash
wrangler publish
```

Your URL: `https://llm-deployment.your-subdomain.workers.dev`

---

### Option 5: DigitalOcean App Platform

**Pros**: Reliable, scalable
**Cons**: Paid (starts at $5/month)

#### Steps:

1. Go to [DigitalOcean](https://www.digitalocean.com)
2. Create App → Choose GitHub repository
3. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Port**: 3000
4. Add environment variables
5. Deploy

---

### Option 6: Heroku

**Pros**: Traditional PaaS, easy to use
**Cons**: No free tier anymore ($7/month)

#### Steps:

1. Install Heroku CLI:

```bash
brew tap heroku/brew && brew install heroku
```

2. Login:

```bash
heroku login
```

3. Create app:

```bash
heroku create your-app-name
```

4. Add environment variables:

```bash
heroku config:set GITHUB_TOKEN=...
heroku config:set OPENAI_API_KEY=...
heroku config:set STUDENT_SECRET=...
```

5. Deploy:

```bash
git push heroku main
```

---

## Environment Variables

All deployment options need these environment variables:

| Variable          | Description                  | Example               |
| ----------------- | ---------------------------- | --------------------- |
| `GITHUB_TOKEN`    | GitHub Personal Access Token | `ghp_abc123...`       |
| `OPENAI_API_KEY`  | OpenAI API Key               | `sk-abc123...`        |
| `GITHUB_USERNAME` | Your GitHub username         | `Aadhavancnp`         |
| `STUDENT_SECRET`  | Your secret from form        | `my-secret-123`       |
| `STUDENT_EMAIL`   | Your student email           | `student@example.com` |
| `PORT`            | Server port (optional)       | `3000`                |

---

## Testing Deployment

After deployment, test your endpoint:

```bash
# Health check
curl https://your-deployed-url.com/

# Test build endpoint
curl https://your-deployed-url.com/api/build \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

---

## Monitoring

### Check Logs

**Vercel:**

```bash
vercel logs
```

**Railway:** View in dashboard → Logs tab

**Render:** View in dashboard → Logs

**Heroku:**

```bash
heroku logs --tail
```

### Health Monitoring

Set up uptime monitoring with:

- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [Better Uptime](https://betteruptime.com/)

---

## Troubleshooting

### Deployment fails

- Check all environment variables are set
- Verify Node.js version (18+)
- Check build logs for errors

### API returns 500

- Check environment variables
- Verify GitHub token has correct permissions
- Check OpenAI API key is valid

### Can't access endpoint

- Verify URL is correct
- Check if service is running
- Test with health check endpoint first

---

## Cost Estimates

| Service                | Free Tier              | Cost After Free |
| ---------------------- | ---------------------- | --------------- |
| **ngrok**              | Yes (with limitations) | $8/month        |
| **Vercel**             | Yes (generous)         | $20/month       |
| **Railway**            | $5 credit              | $5/month after  |
| **Render**             | 750 hours/month        | $7/month        |
| **Cloudflare Workers** | 100k requests/day      | $5/10M requests |
| **DigitalOcean**       | No                     | $5/month        |
| **Heroku**             | No                     | $7/month        |

**Recommended for course**: ngrok (local) or Vercel (cloud)

---

## Security Checklist

- ✅ Never commit `.env` file
- ✅ Use environment variables for secrets
- ✅ Verify secret on every request
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Monitor API usage
- ✅ Set up rate limiting (optional)

---

## Support

If you encounter issues:

1. Check this guide thoroughly
2. Review server logs
3. Test locally first with ngrok
4. Verify all credentials are correct
5. Contact course instructors if needed
