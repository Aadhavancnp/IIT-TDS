# Visual System Overview

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INSTRUCTOR EVALUATION SYSTEM                      │
│                                                                          │
│  ┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐ │
│  │  Task Generator │      │   Evaluation     │      │   Results DB   │ │
│  │                 │      │    Endpoint      │      │                │ │
│  │  - Round 1      │      │  - Receive repos │      │  - Scores      │ │
│  │  - Round 2      │      │  - Queue checks  │      │  - Logs        │ │
│  └────────┬────────┘      └────────▲─────────┘      └────────────────┘ │
│           │                        │                                     │
└───────────┼────────────────────────┼─────────────────────────────────────┘
            │                        │
            │ POST /api/build        │ POST repo details
            │ {task, brief, ...}     │ {repo_url, commit_sha, ...}
            │                        │
            ▼                        │
┌─────────────────────────────────────────────────────────────────────────┐
│                     YOUR DEPLOYMENT SYSTEM (SERVER)                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     server.js (Main Entry)                       │   │
│  │                                                                   │   │
│  │  GET  /           → Health check                                │   │
│  │  POST /api/build  → Build & deploy handler                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                              │
│           │ 1. Validate Request                                         │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      lib/validator.js                            │   │
│  │                                                                   │   │
│  │  ✓ Check required fields                                        │   │
│  │  ✓ Verify email format                                          │   │
│  │  ✓ Validate round number                                        │   │
│  │  ✓ Check secret matches                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                              │
│           │ 2. Return 200 OK (< 1 second)                               │
│           │                                                              │
│           │ 3. Process Async                                            │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     lib/generator.js                             │   │
│  │                                                                   │   │
│  │  • Build prompt from brief + checks                             │   │
│  │  • Decode data URI attachments                                  │   │
│  │  • Call OpenAI API ───────────────┐                             │   │
│  │  • Parse HTML response            │                             │   │
│  └───────────────────────────────────┼─────────────────────────────┘   │
│           │                           │                                  │
│           │                           ▼                                  │
│           │                  ┌─────────────────┐                        │
│           │                  │   OpenAI API    │                        │
│           │                  │                 │                        │
│           │                  │  gpt-4o-mini    │                        │
│           │                  │                 │                        │
│           │                  │  Returns HTML   │                        │
│           │                  └─────────────────┘                        │
│           │ 4. Generated Code                                           │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      lib/github.js                               │   │
│  │                                                                   │   │
│  │  Round 1:                    Round 2:                           │   │
│  │  • Create new repo           • Update existing repo             │   │
│  │  • Add LICENSE               • Commit changes                   │   │
│  │  • Add README                • Update README                    │   │
│  │  • Push code                 • Push code                        │   │
│  │  • Enable Pages              • Pages auto-redeploys             │   │
│  │                                                                   │   │
│  │  Calls GitHub API ────────────────┐                             │   │
│  └───────────────────────────────────┼─────────────────────────────┘   │
│           │                           │                                  │
│           │                           ▼                                  │
│           │                  ┌─────────────────┐                        │
│           │                  │   GitHub API    │                        │
│           │                  │                 │                        │
│           │                  │  • Create repo  │                        │
│           │                  │  • Push files   │                        │
│           │                  │  • Enable Pages │                        │
│           │                  └─────────────────┘                        │
│           │ 5. Deployment Complete                                      │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     lib/evaluator.js                             │   │
│  │                                                                   │   │
│  │  • Build callback payload                                       │   │
│  │  • POST to evaluation_url                                       │   │
│  │  • Retry on failure:                                            │   │
│  │    - Attempt 1: immediate                                       │   │
│  │    - Attempt 2: wait 1s                                         │   │
│  │    - Attempt 3: wait 2s                                         │   │
│  │    - Attempt 4: wait 4s                                         │   │
│  │    - Attempt 5: wait 8s ─────────────┐                         │   │
│  └──────────────────────────────────────┼─────────────────────────┘   │
│           │                              │                              │
└───────────┼──────────────────────────────┼──────────────────────────────┘
            │                              │
            └──────────────────────────────┘
                        │
                        │ Success/Failure logged
                        ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                          GITHUB (OUTPUT)                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Repository: username/task-name-r1                                │  │
│  │                                                                    │  │
│  │  Files:                                                           │  │
│  │  ├── LICENSE             (MIT)                                    │  │
│  │  ├── README.md           (Professional docs)                      │  │
│  │  └── index.html          (Generated app)                         │  │
│  │                                                                    │  │
│  │  Settings:                                                        │  │
│  │  └── Pages: ✅ Enabled (main branch, / root)                     │  │
│  │                                                                    │  │
│  │  URLs:                                                            │  │
│  │  • Repo:  https://github.com/username/task-name-r1              │  │
│  │  • Pages: https://username.github.io/task-name-r1/              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Request-Response Flow

```
Time    Client                  Your System              OpenAI      GitHub      Evaluator
────────────────────────────────────────────────────────────────────────────────────────────
0.0s    POST /api/build ───────→
                                 Validate
                                 Verify secret
0.1s                            ←─── 200 OK
                                    ⬇
                                 Generate
0.5s                                 ──────────→
1.0s                            ←─── HTML code
                                    ⬇
                                 Create repo
1.5s                                 ────────────────────→
                                 Push files
2.0s                            ←─── Repo created
                                    ⬇
                                 Enable Pages
2.5s                                 ────────────────────→
3.0s                            ←─── Pages enabled
                                    ⬇
                                 Wait for deploy
5.0s                                 ────────────────────→
                                    Pages live
                                    ⬇
                                 POST callback
5.5s                                 ────────────────────────────────────────→
6.0s                            ←─── 200 OK ──────────────────────────────────
                                    ⬇
                                 ✅ Done
```

## Component Interaction Map

```
┌────────────┐
│  server.js │ ──── Receives requests, orchestrates workflow
└─────┬──────┘
      │
      ├─────→ validator.js ──── Validates & verifies
      │          ↓
      │       Success?
      │          ↓
      ├─────→ generator.js ──── Generates code
      │          │
      │          ├──→ OpenAI API
      │          │
      │          ↓
      │       HTML code
      │          ↓
      ├─────→ github.js ──────── Creates/updates repo
      │          │
      │          ├──→ GitHub API
      │          │       ├─→ Create repo
      │          │       ├─→ Add files
      │          │       └─→ Enable Pages
      │          │
      │          ↓
      │       Repo URLs
      │          ↓
      └─────→ evaluator.js ──── Notifies evaluator
                 │
                 └──→ Evaluation endpoint
```

## Data Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                          INPUT (Request)                          │
├───────────────────────────────────────────────────────────────────┤
│ {                                                                 │
│   email: "student@example.com",                                  │
│   secret: "***",                                                  │
│   task: "sum-of-sales-abc12",                                    │
│   round: 1,                                                       │
│   nonce: "uuid",                                                  │
│   brief: "Create a page that...",                                │
│   checks: ["Check 1", "Check 2"],                                │
│   evaluation_url: "https://...",                                 │
│   attachments: [{name: "file.csv", url: "data:..."}]            │
│ }                                                                 │
└───────────────────┬───────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                        PROCESSING                                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Validator ────→ Valid? ───→ generator ───→ HTML                 │
│                     │                                             │
│                  Invalid                                          │
│                     ↓                                             │
│               Return 400/403                                      │
│                                                                   │
│  HTML ────→ github.js ───→ Create repo ───→ Push files          │
│                                                                   │
│  Repo ────→ evaluator.js ───→ POST ───→ Retry if needed         │
│                                                                   │
└───────────────────┬───────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                      OUTPUT (Callback)                            │
├───────────────────────────────────────────────────────────────────┤
│ {                                                                 │
│   email: "student@example.com",                                  │
│   task: "sum-of-sales-abc12",                                    │
│   round: 1,                                                       │
│   nonce: "uuid",                                                  │
│   repo_url: "https://github.com/user/repo",                      │
│   commit_sha: "abc123...",                                        │
│   pages_url: "https://user.github.io/repo/"                      │
│ }                                                                 │
└───────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
                     Request
                        ↓
              ┌─────────────────┐
              │   Validation    │
              └────┬────────┬───┘
            Valid  │        │ Invalid
                   │        │
                   │        ├──→ 400 Bad Request
                   │        └──→ Log error
                   ↓
              ┌─────────────────┐
              │  Secret Check   │
              └────┬────────┬───┘
            Match  │        │ No Match
                   │        │
                   │        ├──→ 403 Forbidden
                   │        └──→ Log error
                   ▼
              ┌─────────────────┐
              │   Return 200    │
              └─────────────────┘
                   │
                   ▼
              ┌─────────────────┐
              │   Try Generate  │
              └────┬────────┬───┘
            Success│        │ Error
                   │        │
                   │        ├──→ Log error
                   │        └──→ Stop processing
                   ▼
              ┌─────────────────┐
              │  Try Create Repo│
              └────┬────────┬───┘
            Success│        │ Error
                   │        │
                   │        ├──→ Log error
                   │        └──→ Stop processing
                   ▼
              ┌─────────────────┐
              │  Try Callback   │
              │   (with retry)  │
              └────┬────────┬───┘
            Success│        │ All Failed
                   │        │
                   ▼        ├──→ Log warning
              ✅ Complete   └──→ Continue anyway
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OPTIONS                          │
└────────────────────────────────────────────────────────────────┘

Option 1: Local + ngrok
┌──────────────┐      ┌─────────┐      ┌──────────┐
│ Your Machine │ ───→ │  ngrok  │ ───→ │ Internet │
│   (server)   │      │ (tunnel)│      │          │
└──────────────┘      └─────────┘      └──────────┘
localhost:3000        abc.ngrok.io

Option 2: Vercel (Serverless)
┌──────────────┐      ┌─────────┐      ┌──────────┐
│ GitHub Repo  │ ───→ │ Vercel  │ ───→ │ Internet │
│   (source)   │      │ (edge)  │      │          │
└──────────────┘      └─────────┘      └──────────┘
                    your-app.vercel.app

Option 3: Railway (Container)
┌──────────────┐      ┌─────────┐      ┌──────────┐
│ GitHub Repo  │ ───→ │ Railway │ ───→ │ Internet │
│   (source)   │      │(container)     │          │
└──────────────┘      └─────────┘      └──────────┘
                  your-app.railway.app

Option 4: Render (Web Service)
┌──────────────┐      ┌─────────┐      ┌──────────┐
│ GitHub Repo  │ ───→ │ Render  │ ───→ │ Internet │
│   (source)   │      │(service)│      │          │
└──────────────┘      └─────────┘      └──────────┘
                   your-app.onrender.com
```

## Security Model

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Extract Secret   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐     ┌───────────────┐
│ Compare with     │ ──→ │ .env file     │
│ STUDENT_SECRET   │ ←── │ (secure)      │
└──────┬───────────┘     └───────────────┘
       │
       ├──→ Match: Process
       │
       └──→ No Match: 403

Environment Variables (Secure Storage)
┌────────────────────────────────────┐
│ GITHUB_TOKEN      (never in code) │
│ OPENAI_API_KEY    (never in code) │
│ STUDENT_SECRET    (never in code) │
│ STUDENT_EMAIL     (never in code) │
└────────────────────────────────────┘
```

---

**This visual guide complements the written documentation.**
**Refer to README.md and other docs for detailed instructions.**
