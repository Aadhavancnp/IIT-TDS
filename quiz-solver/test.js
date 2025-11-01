#!/usr/bin/env bun
/**
 * Test Script for LLM Analysis Quiz Solver
 * Tests the API with the demo endpoint
 */

import axios from 'axios';

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/solve`;

async function test() {
  console.log('\n🧪 Testing LLM Analysis Quiz Solver\n');

  try {
    // Load environment
    const email = process.env.STUDENT_EMAIL;
    const secret = process.env.STUDENT_SECRET;

    if (!email || !secret) {
      console.error('❌ Missing STUDENT_EMAIL or STUDENT_SECRET in .env file');
      console.log('\nRun: bun run setup\n');
      process.exit(1);
    }

    console.log('Testing with:');
    console.log('Email:', email);
    console.log('Secret:', secret.substring(0, 3) + '...');
    console.log('API:', API_URL);
    console.log('\n--- Test 1: Health Check ---\n');

    const healthResponse = await axios.get(`http://localhost:${PORT}/`);
    console.log('✅ Health check passed');
    console.log('Response:', healthResponse.data);

    console.log('\n--- Test 2: Invalid Secret ---\n');

    try {
      await axios.post(API_URL, {
        email: email,
        secret: 'wrong-secret',
        url: 'https://tds-llm-analysis.s-anand.net/demo'
      });
      console.log('❌ Should have rejected invalid secret');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected invalid secret');
      } else {
        console.log('❌ Wrong error:', error.message);
      }
    }

    console.log('\n--- Test 3: Missing Fields ---\n');

    try {
      await axios.post(API_URL, {
        email: email
        // missing secret and url
      });
      console.log('❌ Should have rejected missing fields');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected missing fields');
      } else {
        console.log('❌ Wrong error:', error.message);
      }
    }

    console.log('\n--- Test 4: Demo Quiz (Valid Request) ---\n');
    console.log('This will start the actual quiz solving process...');
    console.log('Watch the server logs for detailed progress.\n');

    const demoResponse = await axios.post(API_URL, {
      email: email,
      secret: secret,
      url: 'https://tds-llm-analysis.s-anand.net/demo'
    });

    console.log('✅ Request accepted');
    console.log('Response:', demoResponse.data);
    console.log('\n⏳ Quiz solving in progress (check server logs)...');
    console.log('This may take 1-2 minutes.\n');

    console.log('💡 Tip: Watch the main terminal where you ran "bun start"');
    console.log('         to see the quiz being solved step-by-step.\n');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to server');
      console.log('\nMake sure the server is running:');
      console.log('  bun start\n');
    } else {
      console.error('❌ Test failed:', error.message);
      if (error.response) {
        console.log('Response:', error.response.data);
      }
    }
    process.exit(1);
  }
}

test();
