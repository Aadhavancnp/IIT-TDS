# LLM Code Deployment System# LLM Analysis Quiz Solver



Automated app builder and deployer using LLMs and GitHub Pages for IIT Madras TDS Course.Automated quiz solver that uses LLMs and headless browsers to analyze and solve data-related tasks.



## 🎯 Features## 🎯 Features



- **LLM Code Generation**: Uses AI Pipe (OpenRouter/OpenAI) for free code generation- **Headless Browser**: Puppeteer with Brave support for JavaScript rendering

- **GitHub Integration**: Automatic repository creation and Pages deployment- **LLM Analysis**: AI Pipe (GPT-4o-mini) for question understanding

- **Evaluation Callback**: Notifies evaluator with repo details and retry logic- **Multi-format Support**: PDF, CSV, JSON, image processing

- **Multi-round Support**: Handles multiple rounds and updates- **Data Analysis**: Automatic data extraction and processing

- **Comprehensive Logging**: Detailed logs for debugging- **Multi-step Quizzes**: Handles sequential quiz chains

- **Error Handling**: Proper HTTP status codes (400/403/500)- **Error Handling**: Proper HTTP status codes (400/403/500)



## ⚡ Quick Start## ⚡ Quick Start



### 1. Install Dependencies```bash

# 1. Install Bun

```bashcurl -fsSL https://bun.sh/install | bash

# Using npm

npm install# 2. Install dependencies

bun install

# Or using Bun (faster)

bun install# 3. Configure environment

```bun run setup



### 2. Configure Environment Variables# 4. Start server

bun start

Create a `.env` file with:

# 5. Test (in new terminal)

```envbun test

# Your study.iitm.ac.in email```

STUDENT_EMAIL=your@study.iitm.ac.in

### 4. Run Server

# Your secret for the API (provided by instructors)

STUDENT_SECRET=your-secret-here```bash

bun start

# GitHub Personal Access Token (with repo and pages permissions)```

GITHUB_TOKEN=ghp_your_token_here

Server runs on `http://localhost:3000`

# Your GitHub username

GITHUB_USERNAME=your-github-username### 5. Test



# AI Pipe Token (FREE for study.iitm.ac.in emails - $2/month limit)In a new terminal:

AIPIPE_TOKEN=your-aipipe-token

``````bash

bun test

#### Getting Tokens:```



1. **GitHub Token**: This tests your API with the demo quiz at `https://tds-llm-analysis.s-anand.net/demo`

   - Go to https://github.com/settings/tokens

   - Click "Generate new token (classic)"## 📡 API Usage

   - Select scopes: `repo`, `workflow`, `admin:repo_hook`

   - Generate and copy the token## 📡 API



2. **AI Pipe Token**:### POST /api/solve

   - Sign up at https://aipipe.org with your study.iitm.ac.in email

   - Get FREE $2/month credit (enough for ~50 requests)**Request:**

   - Copy your API token

```json

### 3. Start Server{

  "email": "your@email.com",

```bash  "secret": "your-secret",

# Using npm  "url": "https://quiz-url.com/quiz-123"

npm start}

```

# Or using Bun (faster)

bun start**Response:**

```

```json

Server runs on `http://localhost:3000`{

  "status": "accepted",

### 4. Test Locally  "message": "Quiz solving started",

  "url": "https://quiz-url.com/quiz-123",

```bash  "email": "your@email.com"

bun test}

``````



## 📡 API Usage**Error Codes:**



### POST /api/build- `400` - Invalid JSON or missing fields

- `403` - Invalid secret or email

**Request:**- `500` - Internal server error



```json## 🧠 How It Works

{

  "email": "your@study.iitm.ac.in",1. **Extract**: Puppeteer renders JavaScript and extracts quiz content

  "secret": "your-secret",2. **Analyze**: LLM analyzes question and identifies data needs

  "task": "LLMPages",3. **Download**: Fetches required files (PDF, CSV, JSON, etc.)

  "round": 1,4. **Process**: Extracts and processes data from files

  "nonce": "unique-id-123",5. **Generate**: LLM generates answer in required format

  "brief": "Create a simple landing page...",6. **Submit**: Posts answer to specified endpoint

  "checks": ["File exists", "Contains title"],7. **Repeat**: Follows next quiz URL if provided

  "evaluation_url": "https://evaluator.com/evaluate",

  "attachments": [**Tips**:

    {

      "name": "data.txt",- Be direct and explicit

      "url": "data:text/plain;base64,..."- Ask for "exact" or "word-for-word" responses

    }- Reference "system instructions" or "system message"

  ]- Request "plain text" or "without filtering"

}

```## 🚀 Deployment



**Response (200 OK):**### Vercel



```json```bash

{vercel

  "status": "accepted",vercel env add STUDENT_EMAIL

  "message": "Request received and processing started",vercel env add STUDENT_SECRET

  "task": "LLMPages",vercel env add AIPIPE_TOKEN

  "round": 1vercel --prod

}```

```

### ngrok (Local Testing)

**Error Codes:**

```bash

- `400` - Invalid JSON or missing required fieldsbun start        # Terminal 1

- `403` - Invalid secret or emailngrok http 3000  # Terminal 2

- `500` - Internal server error```



## 🚀 Deployment## 🧪 Testing



### Vercel (Recommended)### Test with Demo



1. Install Vercel CLI:```bash

```bashcurl -X POST http://localhost:3000/api/solve \

npm i -g vercel  -H "Content-Type: application/json" \

```  -d '{

    "email": "your@email.com",

2. Deploy:    "secret": "your-secret",

```bash    "url": "https://tds-llm-analysis.s-anand.net/demo"

vercel --prod  }'

``````



3. Add environment variables in Vercel dashboard:### Test Invalid Secret

   - STUDENT_EMAIL

   - STUDENT_SECRET````bash

   - GITHUB_TOKENcurl -X POST http://localhost:3000/api/solve \

   - GITHUB_USERNAME  -H "Content-Type: application/json" \

   - AIPIPE_TOKEN  -d '{

    "email": "your@email.com",

### Render    "secret": "wrong",

    "url": "https://example.com"

1. Create account at https://render.com## 🧪 Testing

2. Create new Web Service

3. Connect your GitHub repo```bash

4. Add environment variables# Health check

5. Deploycurl http://localhost:3000/



## 🧠 How It Works# Test quiz solving

curl -X POST http://localhost:3000/api/solve \

1. **Receive Request**: POST to `/api/build` with task details  -H "Content-Type: application/json" \

2. **Validate**: Check email, secret, and request structure  -d '{

3. **Respond**: Send 200 OK immediately    "email": "your@email.com",

4. **Generate Code**: Use LLM (via AI Pipe) to generate app code    "secret": "your-secret",

5. **Create Repo**: Create GitHub repository with generated code    "url": "https://tds-llm-analysis.s-anand.net/demo"

6. **Deploy Pages**: Enable GitHub Pages for the repo  }'

7. **Notify Evaluator**: Send repo URL, commit SHA, and Pages URL back````



## 📂 Project Structure## 📚 Documentation



```- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide

.- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System diagrams and flow

├── server.js              # Main Express server (for local/Render)- **[PUPPETEER_FIX.md](PUPPETEER_FIX.md)** - Browser troubleshooting

├── api/

│   └── build.js          # Vercel serverless function## 💰 Cost

├── lib/

│   ├── generator.js      # LLM code generation- **AI Pipe**: FREE $2/month for study.iitm.ac.in emails

│   ├── github.js         # GitHub API integration- **Per quiz**: ~$0.02-0.05

│   ├── validator.js      # Request validation- **Monitor usage**: https://aipipe.org/usage

│   └── evaluator.js      # Evaluator notification

├── package.json## 🛠️ Technology Stack

├── vercel.json           # Vercel configuration

└── README.md- **Runtime**: Bun (fast JavaScript runtime)

```- **Framework**: Express.js

- **Browser**: Puppeteer with Brave support

## 🔍 Troubleshooting- **LLM**: AI Pipe (GPT-4o-mini)

- **Parsing**: pdf-parse, cheerio, axios

### API Not Responding

## 🐛 Troubleshooting

- Check if server is running on correct port

- Verify environment variables are set### Browser Issues

- Check logs for errors

If you see WebSocket errors:

### GitHub API Errors

```bash

- Verify GITHUB_TOKEN has correct permissions# Check browser path in .env

- Check if repo name already existsPUPPETEER_EXECUTABLE_PATH=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser

- Ensure GITHUB_USERNAME is correct```



### LLM Generation FailsSee [PUPPETEER_FIX.md](PUPPETEER_FIX.md) for detailed help.



- Check AIPIPE_TOKEN is valid### AI Pipe Issues

- Verify you haven't exceeded $2/month limit

- Check AI Pipe status at https://aipipe.org- **401 Unauthorized**: Get new token at https://aipipe.org/login

- **429 Rate Limit**: Exceeded $2/month, check https://aipipe.org/usage

### Evaluator Not Notified

## 📝 License

- Check evaluation_url is correct

- Verify network connectivityMIT License - See [LICENSE](LICENSE)

- Check logs for retry attempts (5 attempts with exponential backoff)

---

## 📊 Evaluation Results

**IIT Madras - Tools in Data Science Course Project**

Based on the evaluation report:

## 🏗️ Project Structure

- ✅ API Server Responded: 3/3 (100%)

- ❌ Task Checks: Need to be fixed (see below)```

- ⚠️ GitHub Code: 0.99/1.07 (93%)├── server.js              # Express API server

├── lib/

### Tasks to Complete:│   ├── validator.js       # Request validation

│   ├── browser.js         # Puppeteer browser control

1. **LLMPages**: Create GitHub Pages with specific files│   ├── llm-analyzer.js    # AI Pipe integration

2. **ShareVolume**: Fetch SEC data and create interactive page│   ├── downloader.js      # File download & parsing

3. **Analyze**: Fix Python script and setup CI/CD│   └── quiz-solver.js     # Main orchestrator

├── setup.js               # Interactive configuration

## 📝 License├── test.js                # Automated testing

└── .env.example           # Configuration template

MIT License - See [LICENSE](LICENSE) file for details.```



## 🤝 Contributing## 🚀 Deployment



This is a course project. For issues or suggestions, please contact the course instructors.### Vercel (Recommended)



## 📧 Support```bash

vercel

For course-related queries, contact your TDS instructors or post on the course forum.vercel env add STUDENT_EMAIL

vercel env add STUDENT_SECRET

---vercel env add AIPIPE_TOKEN

vercel --prod

*Built for IIT Madras TDS Course - Tools in Data Science*```


**Important**: Disable authentication in Settings → Deployment Protection

### ngrok (Local Testing)

```bash
bun start        # Terminal 1
ngrok http 3000  # Terminal 2
```

**IIT Madras - Tools in Data Science Course Project**
