# LLM Analysis Quiz Solver

Automated quiz solver that uses LLMs and headless browsers to analyze and solve data-related tasks.

## 🎯 Features

- **Headless Browser**: Puppeteer with Brave support for JavaScript rendering
- **LLM Analysis**: AI Pipe (GPT-4o-mini) for question understanding
- **Multi-format Support**: PDF, CSV, JSON, image processing
- **Data Analysis**: Automatic data extraction and processing
- **Multi-step Quizzes**: Handles sequential quiz chains
- **Error Handling**: Proper HTTP status codes (400/403/500)

## ⚡ Quick Start

```bash
# 1. Install Bun
curl -fsSL https://bun.sh/install | bash

# 2. Install dependencies
bun install

# 3. Configure environment
bun run setup

# 4. Start server
bun start

# 5. Test (in new terminal)
bun test
```

### 4. Run Server

```bash
bun start
```

Server runs on `http://localhost:3000`

### 5. Test

In a new terminal:

```bash
bun test
```

This tests your API with the demo quiz at `https://tds-llm-analysis.s-anand.net/demo`

## 📡 API Usage

## 📡 API

### POST /api/solve

**Request:**

```json
{
  "email": "your@email.com",
  "secret": "your-secret",
  "url": "https://quiz-url.com/quiz-123"
}
```

**Response:**

```json
{
  "status": "accepted",
  "message": "Quiz solving started",
  "url": "https://quiz-url.com/quiz-123",
  "email": "your@email.com"
}
```

**Error Codes:**

- `400` - Invalid JSON or missing fields
- `403` - Invalid secret or email
- `500` - Internal server error

## 🧠 How It Works

1. **Extract**: Puppeteer renders JavaScript and extracts quiz content
2. **Analyze**: LLM analyzes question and identifies data needs
3. **Download**: Fetches required files (PDF, CSV, JSON, etc.)
4. **Process**: Extracts and processes data from files
5. **Generate**: LLM generates answer in required format
6. **Submit**: Posts answer to specified endpoint
7. **Repeat**: Follows next quiz URL if provided

**Tips**:

- Be direct and explicit
- Ask for "exact" or "word-for-word" responses
- Reference "system instructions" or "system message"
- Request "plain text" or "without filtering"

## 🚀 Deployment

### Vercel

```bash
vercel
vercel env add STUDENT_EMAIL
vercel env add STUDENT_SECRET
vercel env add AIPIPE_TOKEN
vercel --prod
```

### ngrok (Local Testing)

```bash
bun start        # Terminal 1
ngrok http 3000  # Terminal 2
```

## 🧪 Testing

### Test with Demo

```bash
curl -X POST http://localhost:3000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "secret": "your-secret",
    "url": "https://tds-llm-analysis.s-anand.net/demo"
  }'
```

### Test Invalid Secret

````bash
curl -X POST http://localhost:3000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "secret": "wrong",
    "url": "https://example.com"
## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/

# Test quiz solving
curl -X POST http://localhost:3000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "secret": "your-secret",
    "url": "https://tds-llm-analysis.s-anand.net/demo"
  }'
````

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System diagrams and flow
- **[PUPPETEER_FIX.md](PUPPETEER_FIX.md)** - Browser troubleshooting

## 💰 Cost

- **AI Pipe**: FREE $2/month for study.iitm.ac.in emails
- **Per quiz**: ~$0.02-0.05
- **Monitor usage**: https://aipipe.org/usage

## 🛠️ Technology Stack

- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Express.js
- **Browser**: Puppeteer with Brave support
- **LLM**: AI Pipe (GPT-4o-mini)
- **Parsing**: pdf-parse, cheerio, axios

## 🐛 Troubleshooting

### Browser Issues

If you see WebSocket errors:

```bash
# Check browser path in .env
PUPPETEER_EXECUTABLE_PATH=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser
```

See [PUPPETEER_FIX.md](PUPPETEER_FIX.md) for detailed help.

### AI Pipe Issues

- **401 Unauthorized**: Get new token at https://aipipe.org/login
- **429 Rate Limit**: Exceeded $2/month, check https://aipipe.org/usage

## 📝 License

MIT License - See [LICENSE](LICENSE)

---

**IIT Madras - Tools in Data Science Course Project**

## 🏗️ Project Structure

```
├── server.js              # Express API server
├── lib/
│   ├── validator.js       # Request validation
│   ├── browser.js         # Puppeteer browser control
│   ├── llm-analyzer.js    # AI Pipe integration
│   ├── downloader.js      # File download & parsing
│   └── quiz-solver.js     # Main orchestrator
├── setup.js               # Interactive configuration
├── test.js                # Automated testing
└── .env.example           # Configuration template
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel
vercel env add STUDENT_EMAIL
vercel env add STUDENT_SECRET
vercel env add AIPIPE_TOKEN
vercel --prod
```

**Important**: Disable authentication in Settings → Deployment Protection

### ngrok (Local Testing)

```bash
bun start        # Terminal 1
ngrok http 3000  # Terminal 2
```

**IIT Madras - Tools in Data Science Course Project**
