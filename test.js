#!/usr/bin/env bun

/**
 * Test script for the LLM Code Deployment API
 */

import fs from "fs";

const API_URL = process.env.API_URL || "http://localhost:3000";
const TEST_FILE = process.argv[2] || "test-request.json";

async function testAPI() {
  console.log("🧪 Testing LLM Code Deployment API\n");
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`📄 Test file: ${TEST_FILE}\n`);

  // Check if test file exists
  if (!fs.existsSync(TEST_FILE)) {
    console.error(`❌ Test file not found: ${TEST_FILE}`);
    console.log("\nUsage: node test.js [test-request.json]");
    process.exit(1);
  }

  // Read test request
  const testRequest = JSON.parse(fs.readFileSync(TEST_FILE, "utf-8"));
  console.log("📦 Request payload:");
  console.log(JSON.stringify(testRequest, null, 2));
  console.log("\n⏳ Sending request...\n");

  try {
    const response = await fetch(`${API_URL}/api/build`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRequest),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log("\n📥 Response:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Test passed! Request accepted.");
      console.log("\n⏰ Processing will continue asynchronously.");
      console.log("   Check server logs for progress.\n");
    } else {
      console.log("\n❌ Test failed! Request rejected.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n💡 Make sure the server is running: npm start\n");
    process.exit(1);
  }
}

testAPI();
