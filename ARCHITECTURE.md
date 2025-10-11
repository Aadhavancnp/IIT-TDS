# System Architecture & Workflow

## High-Level Architecture

```
┌─────────────────┐
│   Instructor    │
│  Evaluation     │
│     System      │
└────────┬────────┘
         │
         │ POST /api/build
         │ (Task Request)
         ▼
┌─────────────────────────────────────────────┐
│         Your Deployment System              │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    1. Receive & Validate Request     │  │
│  │       - Check required fields        │  │
│  │       - Verify secret                │  │
│  │       - Return 200 immediately       │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │    2. Generate App (Async)           │  │
│  │       - Parse brief & checks         │  │
│  │       - Decode attachments           │  │
│  │       - Call OpenAI API              │  │
│  │       - Get generated HTML           │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │    3. Create GitHub Repo             │  │
│  │       - Create public repo           │  │
│  │       - Add MIT LICENSE              │  │
│  │       - Generate README.md           │  │
│  │       - Push generated code          │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │    4. Enable GitHub Pages            │  │
│  │       - Configure Pages              │  │
│  │       - Wait for deployment          │  │
│  │       - Get Pages URL                │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │    5. Notify Evaluator               │  │
│  │       - POST repo details            │  │
│  │       - Retry with backoff           │  │
│  │       - Log result                   │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │
         │ POST to evaluation_url
         │ (Repo Details)
         ▼
┌─────────────────┐
│   Evaluation    │
│   Endpoint      │
└─────────────────┘
```

## Request Flow Timeline

```
Time    Student System              Instructor System
─────   ──────────────              ─────────────────
0:00    ← POST /api/build           Send task request

0:00    Validate request
        Verify secret
        Return 200 OK →             Receive 200

0:01    Generate code with LLM
        ↓
0:30    Create GitHub repo
        Add LICENSE
        Add README
        Push code
        ↓
1:00    Enable Pages
        ↓
1:30    POST repo details →         Receive submission

Later   ...                         Evaluate repo
        ...                         ← POST round 2 task

        Receive round 2
        Update existing repo
        POST updated details →      Receive round 2 submission
```

## Component Interaction

```
┌─────────────┐
│   server.js │  Main Express server
└──────┬──────┘
       │
       ├──────────┐
       │          │
       ▼          ▼
┌──────────┐  ┌───────────┐
│validator │  │ generator │
│   .js    │  │    .js    │
└──────────┘  └─────┬─────┘
                    │
              ┌─────▼─────┐
              │  OpenAI   │
              │    API    │
              └───────────┘
       │
       ▼
┌──────────┐
│ github   │
│   .js    │
└────┬─────┘
     │
     ▼
┌──────────┐
│  GitHub  │
│   API    │
└──────────┘
       │
       ▼
┌──────────┐
│evaluator │
│   .js    │
└────┬─────┘
     │
     ▼
┌──────────┐
│ Evaluation│
│ Endpoint │
└──────────┘
```

## Data Flow

### Input (Task Request)

```json
{
  "email": "student@example.com",
  "secret": "my-secret",
  "task": "sum-of-sales-abc12",
  "round": 1,
  "nonce": "uuid",
  "brief": "Create a page...",
  "checks": ["Check 1", "Check 2"],
  "evaluation_url": "https://...",
  "attachments": [
    {
      "name": "data.csv",
      "url": "data:text/csv;base64,..."
    }
  ]
}
```

### Processing

```
Request → Validator → Generator → GitHub API → Evaluator
           ↓            ↓            ↓            ↓
         Valid?     Generated     Created?     Posted?
                     Code         Repo
```

### Output (Evaluation Callback)

```json
{
  "email": "student@example.com",
  "task": "sum-of-sales-abc12",
  "round": 1,
  "nonce": "uuid",
  "repo_url": "https://github.com/user/repo",
  "commit_sha": "abc123...",
  "pages_url": "https://user.github.io/repo/"
}
```

## Error Handling

```
                ┌─────────────┐
                │   Request   │
                └──────┬──────┘
                       │
                ┌──────▼───────┐
                │  Validation  │
                └──┬────────┬──┘
            Success│        │Failure
                   │        │
                   │        └──→ 400 Bad Request
                   │
            ┌──────▼───────┐
            │Secret Check  │
            └──┬────────┬──┘
        Success│        │Failure
               │        │
               │        └──→ 403 Forbidden
               │
        ┌──────▼────────┐
        │  Return 200   │
        └───────────────┘
               │
        ┌──────▼────────┐
        │Generate Code  │
        └──┬────────┬───┘
    Success│        │Error
           │        │
           │        └──→ Log & Stop
           │
    ┌──────▼────────┐
    │ Create Repo   │
    └──┬────────┬───┘
Success│        │Error
       │        │
       │        └──→ Log & Stop
       │
┌──────▼────────┐
│Notify (Retry) │
└──┬────────┬───┘
   │        │
   │        └──→ Log Warning
   ▼
 Done
```

## Retry Logic

```
Attempt 1 → Wait 1s  → Attempt 2 → Wait 2s  → Attempt 3
                                               ↓
Attempt 5 ← Wait 8s  ← Attempt 4 ← Wait 4s  ←┘
    ↓
  Fail or Success
```

## Round 1 vs Round 2

### Round 1: Create New Repo

```
Request (round=1)
  ↓
Generate code
  ↓
Create new repo: task-name-r1
  ↓
Add LICENSE + README + code
  ↓
Enable Pages
  ↓
Notify evaluator
```

### Round 2: Update Existing Repo

```
Request (round=2)
  ↓
Generate updated code
  ↓
Update existing repo: task-name-r1
  ↓
Commit new changes
  ↓
Update README
  ↓
Notify evaluator
```

## Repository Structure

Each generated repo has:

```
task-name-r1/
├── LICENSE           # MIT License
├── README.md         # Professional documentation
└── index.html        # Generated app (single file)
```

## Time Constraints

```
Event                          Time Limit
─────                          ──────────
Receive request                Immediate
Return 200 response            < 1 second
Generate code                  30-60 seconds
Create & deploy repo           1-2 minutes
Notify evaluator              Within 10 minutes
```

## Security Flow

```
Request arrives
  ↓
Extract secret from body
  ↓
Compare with process.env.STUDENT_SECRET
  ↓
  Match? ──Yes──→ Process request
     │
     No
     │
     ↓
  Return 403 Forbidden
```

## Monitoring Points

1. **Request received**: Log email, task, round
2. **Validation**: Log pass/fail
3. **Generation start**: Log OpenAI call
4. **Generation complete**: Log success
5. **Repo creation**: Log repo URL
6. **Pages enabled**: Log Pages URL
7. **Notification**: Log attempts & result
8. **Complete**: Log total time

## Performance Considerations

- **Async processing**: Don't block response
- **Concurrent operations**: Use Promise.all where possible
- **Caching**: Could cache generated templates
- **Rate limiting**: Monitor API usage (OpenAI, GitHub)
- **Timeout handling**: Set reasonable timeouts
- **Resource cleanup**: Clean up temp files if any

## Scalability

Current design handles:

- Sequential requests (one at a time)
- No database needed
- Stateless operation
- Horizontal scaling possible

For higher load:

- Add job queue (Bull, BullMQ)
- Use database for tracking
- Implement rate limiting
- Add load balancer
- Consider serverless functions
