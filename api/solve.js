/**
 * Vercel Serverless Function for Quiz Solving
 */

import { solveQuiz } from '../lib/quiz-solver.js';

export default async function handler(req, res) {
  // Health check for root path
  if (req.url === '/') {
    return res.status(200).json({
      status: 'healthy',
      message: 'LLM Quiz Solver API',
      version: '1.0.0'
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, secret, url } = req.body;

    // Validate required fields
    if (!email || !secret || !url) {
      return res.status(400).json({
        error: 'Missing required fields: email, secret, url'
      });
    }

    // Validate credentials
    if (email !== process.env.STUDENT_EMAIL || secret !== process.env.STUDENT_SECRET) {
      return res.status(403).json({
        error: 'Invalid email or secret'
      });
    }

    // Solve the quiz
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎯 NEW QUIZ REQUEST');
    console.log(`${'='.repeat(60)}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔗 URL: ${url}`);
    
    const result = await solveQuiz(url, email);

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ QUIZ SOLVED SUCCESSFULLY');
    console.log(`${'='.repeat(60)}\n`);

    return res.status(200).json({
      status: 'accepted',
      message: 'Quiz solved and submitted successfully',
      quiz_id: result.quizId,
      submission_time: result.submissionTime
    });

  } catch (error) {
    console.error('❌ Error solving quiz:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
