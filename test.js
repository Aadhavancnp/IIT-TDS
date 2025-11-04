#!/usr/bin/env node
/**
 * Test script for LLM Code Deployment system
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api/build';

const testPayload = {
  email: process.env.STUDENT_EMAIL || '24f1002051@ds.study.iitm.ac.in',
  secret: process.env.STUDENT_SECRET || 'Givefullmarks',
  task: 'TestTask',
  round: 1,
  nonce: `test-${Date.now()}`,
  brief: `Create a simple HTML page with:
- A heading with id="test-heading" containing "Hello World"
- A paragraph with id="test-content" containing "This is a test"
- Bootstrap 5 styling`,
  checks: [
    'index.html exists',
    'Has heading with id="test-heading"',
    'Has paragraph with id="test-content"',
    'Uses Bootstrap 5'
  ],
  evaluation_url: 'https://httpbin.org/post',
  attachments: []
};

async function runTest() {
  console.log('\n🧪 Testing LLM Code Deployment API\n');
  console.log('Target:', API_URL);
  console.log('Email:', testPayload.email);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    console.log('📤 Sending request...\n');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('\n📥 Response:\n');
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('\n✅ TEST PASSED!');
      console.log('\nThe API accepted the request.');
      console.log('Check your GitHub account for a new repository: TestTask-r1');
      console.log('It should appear at: https://github.com/Aadhavancnp/TestTask-r1');
      console.log('\nMonitor the server logs for:');
      console.log('  1. App generation status');
      console.log('  2. Repository creation');
      console.log('  3. GitHub Pages enablement');
      console.log('  4. Evaluator notification');
    } else {
      console.log('\n❌ TEST FAILED!');
      console.log('Expected status 200, got:', response.status);
    }

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ TEST ERROR!\n');
    console.error('Error:', error.message);
    console.error('\nPossible causes:');
    console.error('  1. Server not running (run: npm start)');
    console.error('  2. Wrong API URL');
    console.error('  3. Network issue');
    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(1);
  }
}

runTest();
