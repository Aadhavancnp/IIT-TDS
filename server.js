#!/usr/bin/env bun
/**
 * LLM Analysis Quiz Solver - Main Server
 * Receives quiz tasks via POST /api/solve and solves them using LLMs
 */

import express from 'express';
import { validateRequest } from './lib/validator.js';
import { solveQuiz } from './lib/quiz-solver.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const STUDENT_EMAIL = process.env.STUDENT_EMAIL;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LLM Analysis Quiz Solver',
    email: STUDENT_EMAIL,
    timestamp: new Date().toISOString()
  });
});

// Main quiz solving endpoint
app.post('/api/solve', async (req, res) => {
  const startTime = Date.now();

  console.log('\n=== Received Quiz Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    // Validate request
    const validation = validateRequest(req.body);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.error);
      return res.status(validation.status).json({
        error: validation.error
      });
    }

    const { email, secret, url } = req.body;

    // Respond immediately with 200 OK
    res.status(200).json({
      status: 'accepted',
      message: 'Quiz solving started',
      url: url,
      email: email
    });

    // Process quiz asynchronously (don't block response)
    console.log('✅ Request accepted, processing asynchronously...');

    // Solve the quiz in the background
    solveQuiz(email, secret, url).catch(error => {
      console.error('❌ Quiz solving failed:', error.message);
      console.error(error.stack);
    });

  } catch (error) {
    console.error('❌ Request handling error:', error);

    // Only respond if we haven't sent a response yet
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON'
    });
  }

  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('\n🚀 LLM Analysis Quiz Solver');
    console.log('================================');
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Email: ${STUDENT_EMAIL}`);
    console.log('Ready to solve quizzes!\n');
  });
}

// Export for Vercel serverless
export default app;
