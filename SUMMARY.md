# Project Summary

## What We Built

A complete automated deployment system that:

- Receives app generation requests via REST API
- Uses OpenAI to generate complete web applications
- Creates GitHub repositories automatically
- Deploys to GitHub Pages
- Notifies evaluation endpoints
- Handles multiple rounds of updates

## Project Structure

```
IIT-TDS/
├── 📄 Core Application
│   ├── server.js                 # Main Express server
│   ├── package.json             # Dependencies & scripts
│   └── lib/
│       ├── validator.js         # Request validation
│       ├── generator.js         # LLM code generation
│       ├── github.js            # GitHub integration
│       └── evaluator.js         # Callback with retry
│
├── 📚 Documentation
│   ├── README.md                # Main setup guide
│   ├── DEPLOYMENT.md            # Deployment options
│   ├── ARCHITECTURE.md          # System design
│   ├── EXAMPLES.md              # Sample requests
│   ├── CHECKLIST.md             # Pre-submission checks
│   └── TROUBLESHOOTING.md       # Problem solving
│
├── 🔧 Configuration
│   ├── .env.example             # Environment template
│   ├── .gitignore              # Git ignore rules
│   └── LICENSE                 # MIT License
│
├── 🧪 Testing
│   ├── test.js                 # Test script
│   ├── test-request.json       # Sample request
│   └── setup.js                # Interactive setup
│
├── 🔄 CI/CD
│   └── .github/
│       └── workflows/
│           └── ci.yml          # GitHub Actions
│
└── 📧 Data
    └── email.json              # Student info
```

## Features Implemented

### ✅ Request Handling

- REST API endpoint (`POST /api/build`)
- JSON request validation
- Secret verification
- Immediate 200 response
- Async processing

### ✅ Code Generation

- OpenAI GPT-4o-mini integration
- Single-file HTML generation
- Bootstrap 5 support
- Attachment handling (data URIs)
- Custom brief interpretation

### ✅ GitHub Integration

- Repository creation
- MIT LICENSE addition
- Professional README generation
- Code pushing
- GitHub Pages enabling
- Commit tracking

### ✅ Evaluation Callback

- POST to evaluation endpoint
- Exponential backoff retry (5 attempts)
- 1s, 2s, 4s, 8s, 16s delays
- Success/failure logging

### ✅ Round Support

- Round 1: New repository
- Round 2: Update existing repository
- Maintains same repo across rounds

## Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **dotenv** - Environment configuration

### APIs

- **OpenAI API** - Code generation (GPT-4o-mini)
- **GitHub API** - Repository management (Octokit)

### Deployment Options

- **ngrok** - Local → public URL
- **Vercel** - Serverless deployment
- **Railway** - Cloud hosting
- **Render** - Web service
- **Cloudflare Workers** - Edge deployment
- **DigitalOcean** - App platform
- **Heroku** - Traditional PaaS

## Key Workflows

### Build Workflow

```
POST Request → Validate → Verify Secret → Return 200
                                            ↓
                                   [Async Processing]
                                            ↓
                            Generate Code (OpenAI)
                                            ↓
                              Create GitHub Repo
                                            ↓
                           Add LICENSE + README + Code
                                            ↓
                             Enable GitHub Pages
                                            ↓
                         POST to Evaluation Endpoint
                                            ↓
                                          Done
```

### Round 2 Workflow

```
POST Request (round=2) → Validate → Return 200
                                      ↓
                          Generate Updated Code
                                      ↓
                          Update Existing Repo
                                      ↓
                              Commit Changes
                                      ↓
                         POST to Evaluation Endpoint
                                      ↓
                                    Done
```

## Time Performance

| Step                | Target   | Typical |
| ------------------- | -------- | ------- |
| Request validation  | < 1s     | ~100ms  |
| Return 200          | < 1s     | ~200ms  |
| Code generation     | -        | 30-60s  |
| Repo creation       | -        | 10-20s  |
| Pages deployment    | -        | 1-3 min |
| Evaluation callback | -        | 1-5s    |
| **Total**           | < 10 min | 2-5 min |

## Security Features

- ✅ Secret verification on every request
- ✅ Environment variable configuration
- ✅ No secrets in code
- ✅ `.gitignore` for sensitive files
- ✅ Token permission validation
- ✅ Public repositories only (no secret leaks)

## Testing Strategy

### Local Testing

```bash
npm install           # Install dependencies
npm run setup        # Configure environment
npm start            # Start server
npm run test         # Send test request
```

### Integration Testing

- Test with httpbin.org
- Verify repo creation
- Check Pages deployment
- Confirm callback received

### Pre-Production Testing

- Deploy to test environment
- Send multiple requests
- Verify all components
- Check error handling

## Documentation Quality

### User Guides

- ✅ Step-by-step installation
- ✅ Configuration instructions
- ✅ Deployment options (6 platforms)
- ✅ Testing procedures
- ✅ Troubleshooting guide

### Developer Documentation

- ✅ Architecture diagrams
- ✅ Component interactions
- ✅ Data flow charts
- ✅ Code organization
- ✅ API documentation

### Examples

- ✅ 4 complete task examples
- ✅ Round 1 and Round 2 samples
- ✅ Different task types
- ✅ With and without attachments

## Requirements Met

### Build Phase

- [x] Receives & verifies request
- [x] Uses LLM to generate app
- [x] Deploys to GitHub Pages
- [x] Pings evaluation API
- [x] Creates public repo
- [x] Adds MIT LICENSE
- [x] Writes professional README
- [x] Enables GitHub Pages
- [x] Avoids secrets in git
- [x] Returns within 10 minutes

### Revise Phase (Round 2)

- [x] Accepts second POST request
- [x] Verifies secret
- [x] Returns HTTP 200
- [x] Modifies repo based on brief
- [x] Updates README
- [x] Pushes changes
- [x] Re-deploys Pages
- [x] Posts to evaluation_url

## Reliability Features

### Error Handling

- Try-catch blocks throughout
- Graceful degradation
- Detailed error logging
- User-friendly error messages

### Retry Logic

- Exponential backoff for callbacks
- 5 retry attempts
- Configurable delays
- Success/failure tracking

### Monitoring

- Comprehensive logging
- Step-by-step progress
- Error tracking
- Performance metrics

## Scalability Considerations

### Current Capacity

- Sequential request processing
- No queue system
- Stateless operation
- Single instance

### Future Enhancements

- Job queue (Bull/BullMQ)
- Database for tracking
- Load balancing
- Horizontal scaling
- Caching layer

## Cost Estimates

### Development

- Time: ~4-6 hours
- Cost: $0 (using free tools)

### Operation (Monthly)

- OpenAI API: ~$1-5 (depending on usage)
- GitHub: Free (public repos)
- Deployment: Free tier available
- **Total**: $1-5/month for testing

## Success Criteria

### Functional

- ✅ Accepts valid requests
- ✅ Rejects invalid requests
- ✅ Generates working apps
- ✅ Creates GitHub repos
- ✅ Deploys to Pages
- ✅ Notifies evaluator
- ✅ Handles round 2

### Non-Functional

- ✅ Response time < 1s
- ✅ Total time < 10 min
- ✅ Reliable (retry logic)
- ✅ Secure (secret verification)
- ✅ Maintainable (good code)
- ✅ Well-documented

## Lessons Learned

### Technical

1. Async processing crucial for fast response
2. Exponential backoff needed for reliability
3. GitHub Pages takes 2-3 minutes to activate
4. Data URI handling for attachments
5. Base64 encoding for GitHub API

### Process

1. Documentation is critical
2. Testing catches issues early
3. Examples help understanding
4. Checklists ensure completeness
5. Troubleshooting guide saves time

## Future Improvements

### Features

- [ ] Job queue for concurrent requests
- [ ] Database for request tracking
- [ ] Admin dashboard
- [ ] Analytics/metrics
- [ ] Rate limiting
- [ ] Webhook support

### Enhancements

- [ ] Multiple LLM providers
- [ ] Code quality checks
- [ ] Automated testing of generated apps
- [ ] Template caching
- [ ] Batch processing

### Operations

- [ ] Health check endpoint
- [ ] Metrics collection
- [ ] Alert system
- [ ] Backup strategy
- [ ] Disaster recovery

## Acknowledgments

### Technologies

- Node.js & Express
- OpenAI API
- GitHub API (Octokit)
- Bootstrap 5

### Course

- IIT Madras - Tools in Data Science
- Project: LLM Code Deployment
- Year: 2025

## Quick Links

- Repository: https://github.com/Aadhavancnp/IIT-TDS
- Documentation: See README.md and related files
- Issues: GitHub Issues
- Contact: 24f1002051@ds.study.iitm.ac.in

## Getting Started

```bash
# 1. Clone repository
git clone https://github.com/Aadhavancnp/IIT-TDS.git
cd IIT-TDS

# 2. Install dependencies
npm install

# 3. Configure environment
npm run setup

# 4. Start server
npm start

# 5. Test
npm run test

# 6. Deploy (see DEPLOYMENT.md)
```

## Support

For help:

1. Check TROUBLESHOOTING.md
2. Review documentation
3. Search error messages
4. Contact instructors

---

**Status**: ✅ Ready for Submission

**Last Updated**: October 11, 2025

**Version**: 1.0.0
