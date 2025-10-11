# Example Task Requests

This file contains sample task requests based on the templates from the course requirements.

## Example 1: Sum of Sales

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "sum-of-sales-a1b2c",
  "round": 1,
  "nonce": "550e8400-e29b-41d4-a716-446655440001",
  "brief": "Publish a single-page site that fetches data.csv from attachments, sums its sales column, sets the title to 'Sales Summary 2025', displays the total inside #total-sales, and loads Bootstrap 5 from jsdelivr.",
  "checks": [
    "document.title === 'Sales Summary 2025'",
    "!!document.querySelector(\"link[href*='bootstrap']\")",
    "Math.abs(parseFloat(document.querySelector('#total-sales').textContent) - 1500) < 0.01"
  ],
  "evaluation_url": "https://exam.sanand.workers.dev/notify",
  "attachments": [
    {
      "name": "data.csv",
      "url": "data:text/csv;base64,cHJvZHVjdCxzYWxlcwpBcHBsZSw1MDAKQmFuYW5hLDMwMApDaGVycnksNzAw"
    }
  ]
}
```

### Round 2 for Sum of Sales

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "sum-of-sales-a1b2c",
  "round": 2,
  "nonce": "550e8400-e29b-41d4-a716-446655440002",
  "brief": "Add a Bootstrap table #product-sales that lists each product with its total sales and keeps #total-sales accurate after render.",
  "checks": [
    "document.querySelectorAll('#product-sales tbody tr').length >= 1",
    "(() => { const rows = [...document.querySelectorAll('#product-sales tbody tr td:last-child')]; const sum = rows.reduce((acc, cell) => acc + parseFloat(cell.textContent), 0); return Math.abs(sum - 1500) < 0.01; })()"
  ],
  "evaluation_url": "https://exam.sanand.workers.dev/notify",
  "attachments": []
}
```

---

## Example 2: Markdown to HTML

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "markdown-to-html-x9y8z",
  "round": 1,
  "nonce": "550e8400-e29b-41d4-a716-446655440003",
  "brief": "Publish a static page that converts input.md from attachments to HTML with marked, renders it inside #markdown-output, and loads highlight.js for code blocks.",
  "checks": [
    "!!document.querySelector(\"script[src*='marked']\")",
    "!!document.querySelector(\"script[src*='highlight.js']\")",
    "document.querySelector('#markdown-output').innerHTML.includes('<h')"
  ],
  "evaluation_url": "https://exam.sanand.workers.dev/notify",
  "attachments": [
    {
      "name": "input.md",
      "url": "data:text/markdown;base64,IyBIZWxsbyBXb3JsZAoKVGhpcyBpcyBhICoqbWFya2Rvd24qKiBmaWxlLgoKYGBganMKY29uc3QgbWVzc2FnZSA9ICJIZWxsbyI7CmNvbnNvbGUubG9nKG1lc3NhZ2UpOwpgYGA="
    }
  ]
}
```

### Round 2 for Markdown to HTML

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "markdown-to-html-x9y8z",
  "round": 2,
  "nonce": "550e8400-e29b-41d4-a716-446655440004",
  "brief": "Add tabs #markdown-tabs that switch between rendered HTML in #markdown-output and the original Markdown in #markdown-source while keeping content in sync.",
  "checks": [
    "document.querySelectorAll('#markdown-tabs button').length >= 2",
    "document.querySelector('#markdown-source').textContent.trim().length > 0"
  ],
  "evaluation_url": "https://exam.sanand.workers.dev/notify",
  "attachments": []
}
```

---

## Example 3: GitHub User Created

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "github-user-created-p7q8r",
  "round": 1,
  "nonce": "550e8400-e29b-41d4-a716-446655440005",
  "brief": "Publish a Bootstrap page with form id='github-user-test' that fetches a GitHub username, optionally uses ?token=, and displays the account creation date in YYYY-MM-DD UTC inside #github-created-at.",
  "checks": [
    "document.querySelector('#github-user-test').tagName === 'FORM'",
    "document.querySelector('#github-created-at').textContent.includes('20')",
    "!!document.querySelector(\"script\").textContent.includes('https://api.github.com/users/')"
  ],
  "evaluation_url": "https://exam.sanand.workers.dev/notify",
  "attachments": []
}
```

### Round 2 for GitHub User Created

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "github-user-created-p7q8r",
  "round": 2,
  "nonce": "550e8400-e29b-41d4-a716-446655440006",
  "brief": "Show an aria-live alert #github-status that reports when a lookup starts, succeeds, or fails.",
  "checks": [
    "document.querySelector('#github-status').getAttribute('aria-live') === 'polite'",
    "!!document.querySelector(\"script\").textContent.includes('github-status')"
  ],
  "evaluation_url": "https://exam.sanand.workers.dev/notify",
  "attachments": []
}
```

---

## Example 4: Simple Test Case

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "your-secret",
  "task": "hello-world-test",
  "round": 1,
  "nonce": "test-nonce-123",
  "brief": "Create a simple Bootstrap 5 page that displays 'Hello World' in an h1 tag with id='greeting'. Include a button with id='click-me' that shows an alert when clicked.",
  "checks": [
    "Page has Bootstrap 5 loaded from CDN",
    "H1 element with id='greeting' exists and contains 'Hello World'",
    "Button with id='click-me' exists",
    "Page has a professional appearance"
  ],
  "evaluation_url": "https://httpbin.org/post",
  "attachments": []
}
```

---

## Testing These Examples

### 1. Save an example to a file

```bash
# Copy one of the examples above to test-request.json
# Make sure to update:
# - email (your email)
# - secret (your secret)
# - evaluation_url (testing: use httpbin.org/post)
```

### 2. Test locally

```bash
# Start server
npm start

# In another terminal, send request
npm run test
```

### 3. Check results

```bash
# Watch server logs for progress
# Check GitHub for created repository
# Visit Pages URL to see deployed app
# Check evaluation_url for callback
```

---

## Decoding Attachments

The attachments in the examples above are base64-encoded. Here's how to decode them:

### data.csv (Example 1)

```
product,sales
Apple,500
Banana,300
Cherry,700
```

### input.md (Example 2)

```markdown
# Hello World

This is a **markdown** file.

\`\`\`js
const message = "Hello";
console.log(message);
\`\`\`
```

---

## Creating Your Own Test Requests

### 1. Encode attachments

```bash
# Encode a file to base64
base64 -i myfile.csv

# Or in Node.js
node -e "console.log(Buffer.from('your content').toString('base64'))"
```

### 2. Create data URI

Format: `data:<mimetype>;base64,<base64data>`

Examples:

- CSV: `data:text/csv;base64,...`
- JSON: `data:application/json;base64,...`
- Markdown: `data:text/markdown;base64,...`
- Image: `data:image/png;base64,...`

### 3. Build request object

```json
{
  "email": "your-email",
  "secret": "your-secret",
  "task": "unique-task-id",
  "round": 1,
  "nonce": "unique-nonce",
  "brief": "Clear description...",
  "checks": ["Check 1", "Check 2"],
  "evaluation_url": "https://...",
  "attachments": [
    {
      "name": "filename.ext",
      "url": "data:mime/type;base64,..."
    }
  ]
}
```

### 4. Test with curl

```bash
curl http://localhost:3000/api/build \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

---

## Expected Outcomes

### Immediate Response (< 1 second)

```json
{
  "status": "accepted",
  "message": "Request received and processing started",
  "task": "your-task-id",
  "round": 1
}
```

### Server Logs (1-2 minutes)

```
=== Received Build Request ===
Email: 24f1002051@ds.study.iitm.ac.in
Task: sum-of-sales-a1b2c
Round: 1

=== Starting App Generation ===
Generating app with OpenAI...
✓ App generated successfully

=== Creating GitHub Repository ===
Creating repository: sum-of-sales-a1b2c-r1
✓ Repository created
✓ LICENSE added
✓ README.md added
✓ index.html added
✓ GitHub Pages enabled

=== Notifying Evaluator ===
✓ Evaluator notified successfully

=== Process Complete ===
```

### Created Repository

- Public GitHub repository
- MIT LICENSE file
- Professional README.md
- Generated index.html
- GitHub Pages enabled

### Evaluation Callback

POST to evaluation_url:

```json
{
  "email": "24f1002051@ds.study.iitm.ac.in",
  "task": "sum-of-sales-a1b2c",
  "round": 1,
  "nonce": "550e8400-e29b-41d4-a716-446655440001",
  "repo_url": "https://github.com/Aadhavancnp/sum-of-sales-a1b2c-r1",
  "commit_sha": "abc123def456...",
  "pages_url": "https://aadhavancnp.github.io/sum-of-sales-a1b2c-r1/"
}
```

---

## Troubleshooting Test Requests

### Request rejected (400)

- Check all required fields are present
- Verify JSON is valid
- Check field types (round should be number)

### Forbidden (403)

- Secret doesn't match
- Check STUDENT_SECRET in .env

### Generation fails

- Check OpenAI API key is valid
- Verify you have API credits
- Brief might be too complex

### Repository creation fails

- Check GitHub token has repo permissions
- Verify GITHUB_USERNAME is correct
- Check if repo name already exists

### Pages not deploying

- Wait 2-3 minutes
- Check repository Settings → Pages
- Verify repo is public

### Evaluation callback fails

- Check evaluation_url is reachable
- Verify it accepts POST requests
- System retries 5 times with backoff
