#!/usr/bin/env node
/**
 * Test with actual LLMPages task from evaluation
 */

const testPayload = {
  "email": "24f1002051@ds.study.iitm.ac.in",
  "secret": "Givefullmarks",
  "task": "LLMPages",
  "round": 1,
  "nonce": "test-llmpages-" + Date.now(),
  "brief": `Create and publish these files as a public GitHub Pages site:

- about.md: Describe yourself in three words.
- pelican.svg: Generate an SVG of a pelican riding a bicycle.
- index.html: A homepage linking to all the above files explaining what they are.
- LICENSE: An MIT license file.
- uid.txt: Create a simple text file with content "test-uid-123"`,
  "checks": [
    "Each required file exists on GitHub",
    "uid.txt matches the content",
    "LICENSE contains the MIT License text",
    "index.html links to all required assets",
    "about.md contains exactly three words",
    "pelican.svg is valid SVG"
  ],
  "evaluation_url": "https://httpbin.org/post",
  "attachments": []
};

async function runTest() {
  console.log('\n🧪 Testing LLMPages Task\n');
  console.log('Email:', testPayload.email);
  console.log('Task:', testPayload.task);
  console.log('Round:', testPayload.round);
  console.log('\n' + '='.repeat(70) + '\n');

  try {
    console.log('📤 Sending request to http://localhost:3000/api/build\n');
    
    const response = await fetch('http://localhost:3000/api/build', {
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

    if (response.status === 200 && data.status === 'accepted') {
      console.log('\n✅ API ACCEPTED REQUEST!');
      console.log('\n📋 Next Steps:');
      console.log('  1. Watch the server logs above for processing status');
      console.log('  2. Check GitHub for new repo: https://github.com/Aadhavancnp/LLMPages-r1');
      console.log('  3. Verify GitHub Pages: https://Aadhavancnp.github.io/LLMPages-r1/');
      console.log('  4. Check files:');
      console.log('     - about.md (3 words)');
      console.log('     - pelican.svg (valid SVG)');
      console.log('     - index.html (links to all files)');
      console.log('     - LICENSE (MIT License)');
      console.log('     - uid.txt (test-uid-123)');
      console.log('\n⏳ Processing will take 30-60 seconds...');
      console.log('   Watch server logs for progress!\n');
    } else {
      console.log('\n❌ TEST FAILED!');
      console.log('Expected status 200 with "accepted", got:', response.status, data);
    }

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ TEST ERROR!\n');
    console.error('Error:', error.message);
    console.error('\nMake sure server is running: node server.js');
    console.log('\n' + '='.repeat(70) + '\n');
    process.exit(1);
  }
}

runTest();
