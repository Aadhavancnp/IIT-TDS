# Troubleshooting Guide

Common issues and their solutions for the LLM Code Deployment system.

## Table of Contents

1. [Server Issues](#server-issues)
2. [Authentication Issues](#authentication-issues)
3. [Code Generation Issues](#code-generation-issues)
4. [GitHub Issues](#github-issues)
5. [Deployment Issues](#deployment-issues)
6. [Evaluation Issues](#evaluation-issues)

---

## Server Issues

### Server won't start

**Error**: `Cannot find module ...`

**Solution**:

```bash
npm install
```

**Error**: `Error: Cannot find module 'dotenv'`

**Solution**:

```bash
npm install dotenv
```

### Port already in use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Environment variables not loading

**Symptom**: `undefined` values in logs

**Solution**:

1. Check `.env` file exists
2. Restart server after changing `.env`
3. Verify `.env` format (no spaces around `=`)

```env
# Wrong
GITHUB_TOKEN = ghp_123

# Correct
GITHUB_TOKEN=ghp_123
```

---

## Authentication Issues

### Invalid secret error

**Error**: `403 Forbidden - Invalid secret`

**Causes**:

1. Secret in request doesn't match `.env`
2. Extra whitespace in `.env` file
3. `.env` not loaded

**Solution**:

```bash
# Check your .env
cat .env | grep SECRET

# Verify no extra spaces
# Should be: STUDENT_SECRET=your-secret
# Not: STUDENT_SECRET = your-secret

# Restart server
npm start
```

### GitHub authentication failed

**Error**: `401 Bad credentials` from GitHub API

**Causes**:

1. Invalid GitHub token
2. Token expired
3. Missing permissions

**Solution**:

1. Generate new token at https://github.com/settings/tokens
2. Required scopes:
   - ✅ `repo` (all)
   - ✅ `workflow`
   - ✅ `admin:repo_hook`
3. Update `.env` with new token
4. Restart server

### OpenAI authentication failed

**Error**: `401 Incorrect API key provided`

**Solution**:

1. Check API key at https://platform.openai.com/api-keys
2. Generate new key if needed
3. Update `.env`:
   ```env
   OPENAI_API_KEY=sk-your-new-key
   ```
4. Restart server

---

## Code Generation Issues

### OpenAI timeout

**Error**: `Error calling OpenAI API: timeout`

**Causes**:

1. Network issues
2. OpenAI API down
3. Request too complex

**Solution**:

```bash
# Check OpenAI status
curl https://status.openai.com/api/v2/status.json

# Simplify brief if too complex
# Increase timeout (in generator.js)
```

### Generated code invalid

**Symptom**: No HTML generated or malformed HTML

**Solution**:

1. Check OpenAI API response in logs
2. Verify `brief` is clear and specific
3. Check model is `gpt-4o-mini` (or available model)

### Rate limit exceeded

**Error**: `429 Rate limit exceeded`

**Solution**:

```bash
# Wait for rate limit to reset
# Check usage at: https://platform.openai.com/usage

# Consider:
# 1. Increase rate limit (upgrade plan)
# 2. Add delay between requests
# 3. Implement queue system
```

---

## GitHub Issues

### Repository creation failed

**Error**: `422 Repository creation failed`

**Causes**:

1. Repository name already exists
2. Invalid repository name
3. Token lacks permissions

**Solution**:

```bash
# Check if repo exists
curl https://api.github.com/repos/<username>/<reponame>

# Delete existing repo (if testing)
# Go to: https://github.com/<username>/<reponame>/settings
# Scroll down → Delete repository

# Or system will use existing repo
```

### Can't push to repository

**Error**: `403 Resource not accessible by integration`

**Solution**:

1. Verify token has `repo` scope
2. Check repository exists
3. Verify you're the owner

### File upload failed

**Error**: `409 Conflict` or `422 Invalid request`

**Causes**:

1. File already exists (needs SHA to update)
2. Base64 encoding error
3. File path invalid

**Solution**:

```javascript
// Code already handles this in github.js
// If you modify, ensure:
// 1. Get existing file SHA first
// 2. Include SHA in update request
// 3. Base64 encode content correctly
```

---

## Deployment Issues

### GitHub Pages not enabled

**Error**: Pages URL returns 404

**Solution**:

1. Wait 2-3 minutes after creation
2. Check repository Settings → Pages
3. Manual enable if needed:
   ```bash
   # Settings → Pages
   # Source: Deploy from a branch
   # Branch: main / (root)
   ```

### Pages build failed

**Symptom**: Pages URL shows 404 after 5+ minutes

**Solution**:

1. Check repository Actions tab
2. Look for Pages build error
3. Verify `index.html` in root
4. Check file has valid HTML

### Pages content not updating

**Symptom**: Old content still shows

**Solution**:

```bash
# Clear browser cache
# Or use incognito mode

# Force Pages rebuild
# Push a new commit to main branch
```

---

## Evaluation Issues

### Evaluator not receiving callback

**Symptom**: No response from evaluation endpoint

**Solution**:

1. Check `evaluation_url` is correct
2. Verify endpoint accepts POST
3. Check retry logs:
   ```
   ✓ Attempt 1 failed, retrying...
   ✓ Attempt 2 failed, retrying...
   ```
4. Test endpoint:
   ```bash
   curl -X POST <evaluation_url> \
     -H "Content-Type: application/json" \
     -d '{"test":"data"}'
   ```

### Callback returns error

**Error**: `400 Bad Request` from evaluator

**Causes**:

1. Missing required fields
2. Invalid nonce
3. Email doesn't match

**Solution**:

1. Verify all fields included:
   - email
   - task
   - round
   - nonce
   - repo_url
   - commit_sha
   - pages_url
2. Check logs for exact payload sent
3. Verify nonce matches original request

### Exponential backoff not working

**Symptom**: Only tries once

**Solution**:

```javascript
// Check evaluator.js
// Should retry 5 times with delays:
// 1s, 2s, 4s, 8s, 16s

// If modified, ensure:
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  // ... try fetch ...
  if (!response.ok && attempt < maxAttempts - 1) {
    await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
  }
}
```

---

## Request Validation Issues

### Request rejected with 400

**Error**: `Invalid request`

**Causes**:

1. Missing required field
2. Invalid field type
3. Malformed JSON

**Solution**:

```bash
# Validate JSON
cat test-request.json | jq .

# Check required fields:
# - email (string)
# - secret (string)
# - task (string)
# - round (number)
# - nonce (string)
# - brief (string)
# - checks (array)
# - evaluation_url (string)
# - attachments (array, optional)
```

### Email validation failed

**Error**: `Invalid email format`

**Solution**:

```json
{
  "email": "valid.email@example.com"
}
// Not: "email123" or "test@"
```

### Round number invalid

**Error**: `Round must be a positive number`

**Solution**:

```json
{
  "round": 1
}
// Not: "round": "1" (string)
// Not: "round": 0 (must be >= 1)
```

---

## Performance Issues

### Request takes too long

**Symptom**: > 10 minutes to complete

**Causes**:

1. OpenAI API slow
2. Large attachments
3. Complex brief

**Solution**:

1. Monitor OpenAI response time
2. Simplify brief if possible
3. Check network latency
4. Consider using faster model

### Multiple concurrent requests fail

**Symptom**: Only first request succeeds

**Solution**:

```javascript
// Current design: sequential processing
// For concurrent requests, consider:
// 1. Job queue (Bull/BullMQ)
// 2. Worker threads
// 3. Separate instances
```

---

## Debugging Tips

### Enable verbose logging

Add to your code:

```javascript
// In server.js
console.log("Full request body:", JSON.stringify(req.body, null, 2));

// In generator.js
console.log("OpenAI response:", response);

// In github.js
console.log("GitHub API response:", data);
```

### Test components individually

```bash
# Test OpenAI
node -e "
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: 'sk-...' });
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello' }]
});
console.log(completion);
"

# Test GitHub
curl -H "Authorization: token ghp_..." \
  https://api.github.com/user

# Test evaluation endpoint
curl -X POST <evaluation_url> \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Check API limits

```bash
# GitHub rate limit
curl -H "Authorization: token ghp_..." \
  https://api.github.com/rate_limit

# OpenAI usage
# Visit: https://platform.openai.com/usage
```

### Monitor server logs

```bash
# Follow logs in real-time
npm start 2>&1 | tee server.log

# Or with timestamps
npm start 2>&1 | ts '[%Y-%m-%d %H:%M:%S]' | tee server.log
```

---

## Getting Help

If issue persists:

1. **Check logs**: Look for error messages
2. **Test components**: Isolate the problem
3. **Review docs**: Check README, DEPLOYMENT, etc.
4. **Search errors**: Google the error message
5. **Ask instructors**: Provide logs and details

### Information to provide

When asking for help, include:

- Error message (full text)
- Relevant logs (sanitize secrets!)
- What you've tried
- Expected vs actual behavior
- Environment (OS, Node version, etc.)

```bash
# Gather system info
node --version
npm --version
uname -a

# Sanitize and share logs
# Remove secrets before sharing!
```

---

## Prevention

### Before deployment

- [ ] Test locally with multiple requests
- [ ] Verify all environment variables
- [ ] Check token permissions
- [ ] Test with httpbin.org first
- [ ] Monitor API usage/costs

### During operation

- [ ] Monitor logs regularly
- [ ] Check API rate limits
- [ ] Keep dependencies updated
- [ ] Have backup tokens ready
- [ ] Document any issues

### Best practices

- Use `.env` for all secrets
- Never commit secrets
- Test before submitting
- Monitor API costs
- Have rollback plan
- Keep backups of working configs

---

## Quick Reference

### Restart everything

```bash
# Stop server (Ctrl+C)
# Clear any issues
rm -rf node_modules package-lock.json
npm install
npm start
```

### Reset test environment

```bash
# Delete test repos (manual)
# Clear logs
rm *.log

# Fresh start
git pull
npm install
npm start
```

### Emergency fixes

```bash
# GitHub token compromised
# 1. Revoke at: https://github.com/settings/tokens
# 2. Generate new token
# 3. Update .env
# 4. Restart server

# OpenAI key compromised
# 1. Revoke at: https://platform.openai.com/api-keys
# 2. Generate new key
# 3. Update .env
# 4. Restart server
```

---

**Still stuck? Contact course instructors with:**

- What you're trying to do
- What's happening instead
- Error messages
- What you've tried

Good luck! 🚀
