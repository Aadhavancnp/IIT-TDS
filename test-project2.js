#!/usr/bin/env node
/**
 * Test script for Project 2 Quiz Endpoint
 * Tests the endpoint at https://iit-tds.onrender.com/api/solve
 */

const API_URL = process.env.API_URL || 'https://iit-tds.onrender.com/api/solve';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL || '24f1002051@ds.study.iitm.ac.in';
const STUDENT_SECRET = process.env.STUDENT_SECRET || '';

const PROJECT2_URL = 'https://tds-llm-analysis.s-anand.net/project2';

async function testEndpoint() {
  console.log('\n🧪 Testing Project 2 Quiz Endpoint\n');
  console.log('='.repeat(60));
  console.log(`API URL: ${API_URL}`);
  console.log(`Email: ${STUDENT_EMAIL}`);
  console.log(`Secret: ${STUDENT_SECRET ? STUDENT_SECRET.substring(0, 3) + '...' : 'NOT SET'}`);
  console.log(`Project2 URL: ${PROJECT2_URL}`);
  console.log('='.repeat(60) + '\n');

  // Test 1: Health check
  console.log('📋 Test 1: Health Check');
  try {
    const healthUrl = API_URL.replace('/api/solve', '');
    const healthResponse = await fetch(healthUrl);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed');
    console.log('Response:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  console.log('');

  // Test 2: Invalid JSON
  console.log('📋 Test 2: Invalid JSON (should return 400)');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    const data = await response.json();
    if (response.status === 400) {
      console.log('✅ Correctly returned 400 for invalid JSON');
    } else {
      console.log(`⚠️ Expected 400, got ${response.status}`);
    }
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  console.log('');

  // Test 3: Missing fields (should return 400)
  console.log('📋 Test 3: Missing Required Fields (should return 400)');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: STUDENT_EMAIL })
    });
    const data = await response.json();
    if (response.status === 400) {
      console.log('✅ Correctly returned 400 for missing fields');
    } else {
      console.log(`⚠️ Expected 400, got ${response.status}`);
    }
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  console.log('');

  // Test 4: Invalid secret (should return 403)
  console.log('📋 Test 4: Invalid Secret (should return 403)');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: STUDENT_EMAIL,
        secret: 'wrong-secret',
        url: PROJECT2_URL
      })
    });
    const data = await response.json();
    if (response.status === 403) {
      console.log('✅ Correctly returned 403 for invalid secret');
    } else {
      console.log(`⚠️ Expected 403, got ${response.status}`);
    }
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  console.log('');

  // Test 5: Valid request (if secret is provided)
  if (STUDENT_SECRET) {
    console.log('📋 Test 5: Valid Request (should return 200 and start solving)');
    try {
      const startTime = Date.now();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: STUDENT_EMAIL,
          secret: STUDENT_SECRET,
          url: PROJECT2_URL
        })
      });
      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`Status: ${response.status}`);
      console.log(`Response time: ${elapsed}s`);
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (response.status === 200) {
        console.log('✅ Request accepted! Quiz solving started in background.');
        console.log('\n💡 Note: The quiz solving happens asynchronously.');
        console.log('   Check the server logs on Render to see the progress.');
      } else {
        console.log(`⚠️ Expected 200, got ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Test failed:', error.message);
    }
  } else {
    console.log('📋 Test 5: Valid Request (SKIPPED - no secret provided)');
    console.log('💡 Set STUDENT_SECRET environment variable to test with valid credentials');
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('✅ Testing Complete!');
  console.log('='.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('1. If secret is not set, configure it:');
  console.log('   export STUDENT_SECRET="your-secret"');
  console.log('   node test-project2.js');
  console.log('\n2. Monitor server logs on Render dashboard');
  console.log('3. The quiz solving happens asynchronously after 200 response\n');
}

testEndpoint().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});

