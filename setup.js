#!/usr/bin/env bun

/**
 * Setup script for LLM Code Deployment
 */

import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setup() {
  console.log("🚀 LLM Code Deployment - Setup Wizard\n");
  console.log("This wizard will help you configure your environment.\n");

  // Check if .env already exists
  if (fs.existsSync(".env")) {
    const overwrite = await question(
      ".env file already exists. Overwrite? (y/N): "
    );
    if (overwrite.toLowerCase() !== "y") {
      console.log("\n✅ Setup cancelled. Using existing .env file.\n");
      rl.close();
      return;
    }
  }

  console.log("📝 Please provide the following information:\n");

  const config = {};

  // GitHub Token
  config.GITHUB_TOKEN = await question(
    "GitHub Personal Access Token (ghp_...): "
  );
  if (!config.GITHUB_TOKEN.startsWith("ghp_")) {
    console.log('\n⚠️  Warning: GitHub token should start with "ghp_"\n');
  }

  // AI Pipe Token
  console.log("\n🆓 AI Pipe Setup (FREE $2/month for study.iitm.ac.in emails)");
  console.log("   1. Go to: https://aipipe.org/login");
  console.log("   2. Login with your study.iitm.ac.in email");
  console.log("   3. Copy your token\n");
  config.AIPIPE_TOKEN = await question("AI Pipe Token: ");

  // GitHub Username
  config.GITHUB_USERNAME = await question("GitHub Username: ");

  // Student Email
  config.STUDENT_EMAIL = await question("Student Email (study.iitm.ac.in): ");
  if (!config.STUDENT_EMAIL.includes("study.iitm.ac.in")) {
    console.log(
      "\n⚠️  Warning: Email should be from study.iitm.ac.in for free AI Pipe access\n"
    );
  }

  // Student Secret
  config.STUDENT_SECRET = await question("Student Secret (from form): ");

  // Port
  const port = await question("Server Port (default: 3000): ");
  config.PORT = port || "3000";

  console.log("\n📄 Writing .env file...");

  // Create .env file
  const envContent = `# LLM Code Deployment Configuration
# Generated on ${new Date().toISOString()}

# GitHub Personal Access Token (with repo, workflow, and pages permissions)
GITHUB_TOKEN=${config.GITHUB_TOKEN}

# AI Pipe Token (FREE $2/month for study.iitm.ac.in emails)
# Get from: https://aipipe.org/login
# WARNING: Do NOT exceed $2/month limit!
AIPIPE_TOKEN=${config.AIPIPE_TOKEN}

# Your GitHub username (where repos will be created)
GITHUB_USERNAME=${config.GITHUB_USERNAME}

# Your secret (must match what you submitted in the Google Form)
STUDENT_SECRET=${config.STUDENT_SECRET}

# Your student email (must be study.iitm.ac.in)
STUDENT_EMAIL=${config.STUDENT_EMAIL}

# Port for the server
PORT=${config.PORT}
`;

  fs.writeFileSync(".env", envContent);

  console.log("\n✅ Configuration saved to .env\n");
  console.log("� Important Notes:\n");
  console.log("   • AI Pipe is FREE for study.iitm.ac.in emails");
  console.log("   • You get $2 per month - DO NOT EXCEED THIS");
  console.log("   • Monitor usage at: https://aipipe.org/usage\n");
  console.log("�📦 Next steps:\n");
  console.log("   1. Verify your configuration in .env");
  console.log("   2. Install dependencies: bun install");
  console.log("   3. Start the server: bun start");
  console.log("   4. Test the endpoint: bun test\n");

  rl.close();
}

setup().catch((error) => {
  console.error("\n❌ Setup failed:", error.message);
  rl.close();
  process.exit(1);
});
