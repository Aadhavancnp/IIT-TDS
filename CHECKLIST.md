# Pre-Submission Checklist

Use this checklist before submitting your API endpoint to the course.

## ✅ Setup Checklist

### Environment Configuration

- [ ] Created `.env` file from `.env.example`
- [ ] Added GitHub Personal Access Token to `.env`
- [ ] Added OpenAI API Key to `.env`
- [ ] Added GitHub Username to `.env`
- [ ] Added Student Email to `.env`
- [ ] Added Student Secret to `.env`
- [ ] Verified no extra spaces in environment variables

### GitHub Token Verification

- [ ] Token has `repo` scope (full control of repositories)
- [ ] Token has `workflow` scope (for Actions)
- [ ] Token has Pages permissions
- [ ] Token is not expired
- [ ] Can create repositories with token

### OpenAI API Verification

- [ ] API key is valid
- [ ] Have sufficient API credits
- [ ] Can make API calls successfully
- [ ] Familiar with rate limits

### Dependencies

- [ ] Ran `npm install` successfully
- [ ] No dependency errors
- [ ] Node.js version 18 or higher

---

## ✅ Local Testing Checklist

### Server Startup

- [ ] `npm start` runs without errors
- [ ] Server listens on configured port
- [ ] Health check endpoint works (`curl http://localhost:3000/`)
- [ ] Returns correct student email

### API Endpoint Testing

- [ ] Updated `test-request.json` with your credentials
- [ ] Can send POST request to `/api/build`
- [ ] Receives HTTP 200 response
- [ ] Response JSON is correct format

### Code Generation

- [ ] OpenAI generates HTML successfully
- [ ] Generated code includes Bootstrap
- [ ] Generated code matches brief requirements
- [ ] No API errors in logs

### Repository Creation

- [ ] Repository created successfully
- [ ] Repository is public
- [ ] MIT LICENSE file exists
- [ ] README.md is professional and complete
- [ ] Generated code is pushed

### GitHub Pages

- [ ] GitHub Pages enabled automatically
- [ ] Pages URL is accessible (wait 2-3 minutes)
- [ ] Generated app loads in browser
- [ ] No 404 errors

### Evaluation Callback

- [ ] POST request sent to evaluation_url
- [ ] Includes all required fields
- [ ] Retry logic works if endpoint fails
- [ ] Success logged in console

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Tested everything locally first
- [ ] All tests pass
- [ ] No errors in logs
- [ ] `.env` file NOT committed to git
- [ ] Secrets are secure

### Choose Deployment Platform

- [ ] Selected platform (ngrok/Vercel/Railway/etc.)
- [ ] Understand platform limitations
- [ ] Know the free tier limits
- [ ] Have deployment guide ready

### Deploy Application

- [ ] Application deployed successfully
- [ ] Environment variables configured on platform
- [ ] Public URL is accessible
- [ ] Health endpoint returns 200

### Post-Deployment Testing

- [ ] Can access deployed URL
- [ ] Health check works on deployed URL
- [ ] Can send test request to deployed endpoint
- [ ] Repository created from deployed system
- [ ] GitHub Pages works from deployed system
- [ ] Evaluation callback works

---

## ✅ Submission Checklist

### API Endpoint

- [ ] Have stable public URL
- [ ] URL accepts POST requests
- [ ] URL returns 200 within 1 second
- [ ] URL is accessible 24/7 (for evaluation)

### Credentials

- [ ] Student email matches form submission
- [ ] Secret matches form submission
- [ ] GitHub username is correct

### Documentation

- [ ] Understand how system works
- [ ] Can explain each component
- [ ] Know how to debug issues
- [ ] Have monitoring in place

### Final Verification

- [ ] Send one complete test request
- [ ] Verify repo created
- [ ] Check Pages URL loads
- [ ] Confirm evaluation callback sent
- [ ] Review all logs for errors

---

## ✅ Round 2 Readiness

### System Configuration

- [ ] Same endpoint accepts round 2 requests
- [ ] Secret verification still works
- [ ] Can handle `"round": 2` in request
- [ ] Updates existing repository

### Testing Round 2

- [ ] Test round 2 with sample request
- [ ] Existing repo gets updated (not new repo)
- [ ] New code committed
- [ ] README updated
- [ ] Pages redeployed
- [ ] Evaluation callback sent

---

## 🧪 Test Scenarios

### Scenario 1: Simple Hello World

**Brief**: "Create a page with 'Hello World' in h1"

- [ ] Request sent successfully
- [ ] Repo created
- [ ] App displays "Hello World"
- [ ] Pages URL works

### Scenario 2: With Attachments

**Brief**: "Display content from attached CSV"

- [ ] Data URI decoded correctly
- [ ] Content used in generated app
- [ ] App displays data correctly

### Scenario 3: Round 2 Update

**Brief**: "Add new feature to existing app"

- [ ] Existing repo updated
- [ ] New code committed
- [ ] Changes visible on Pages
- [ ] README reflects changes

---

## 🔧 Common Issues & Solutions

### Issue: "Invalid secret"

**Solution**:

- [ ] Check `.env` file has correct secret
- [ ] Verify no extra spaces
- [ ] Restart server after changing `.env`

### Issue: GitHub API rate limit

**Solution**:

- [ ] Check rate limit status
- [ ] Wait for limit reset
- [ ] Use authenticated API calls

### Issue: Pages not loading

**Solution**:

- [ ] Wait 2-3 minutes
- [ ] Check repo Settings → Pages
- [ ] Verify repo is public
- [ ] Check for Pages build errors

### Issue: OpenAI timeout

**Solution**:

- [ ] Check API credits
- [ ] Verify API key
- [ ] Simplify brief if too complex
- [ ] Check OpenAI status page

---

## 📊 Monitoring Checklist

### Logs to Monitor

- [ ] Request reception logs
- [ ] Validation success/failure
- [ ] OpenAI API calls
- [ ] GitHub API calls
- [ ] Pages deployment status
- [ ] Evaluation callback status

### Metrics to Track

- [ ] Response time (should be < 1 second)
- [ ] Total processing time (should be < 10 minutes)
- [ ] Success rate
- [ ] Error rate
- [ ] API costs (OpenAI, GitHub)

---

## 🚀 Ready to Submit?

Before submitting your endpoint URL:

### Final Checks

- [ ] Everything on this checklist is complete
- [ ] Tested multiple times successfully
- [ ] System is stable
- [ ] Monitoring in place
- [ ] Know how to debug issues

### Have Ready

- [ ] API endpoint URL
- [ ] Student email
- [ ] Student secret
- [ ] GitHub username
- [ ] Contact information

### Submission

- [ ] Submit to Google Form
- [ ] Verify submission received
- [ ] Keep system running
- [ ] Monitor logs for incoming requests

---

## 📞 Need Help?

If stuck on any item:

1. Review the README.md
2. Check DEPLOYMENT.md for platform-specific help
3. Review EXAMPLES.md for sample requests
4. Check ARCHITECTURE.md to understand flow
5. Review server logs for errors
6. Contact course instructors

---

## ✨ Success Criteria

Your system is ready when:

- ✅ Responds with 200 within 1 second
- ✅ Generates working apps
- ✅ Creates public repos with LICENSE
- ✅ Deploys to GitHub Pages
- ✅ Notifies evaluator successfully
- ✅ Completes within 10 minutes
- ✅ Handles both round 1 and round 2
- ✅ Is monitored and stable

---

**Good luck! 🎓**
