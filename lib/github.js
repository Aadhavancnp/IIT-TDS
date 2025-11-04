import dotenv from "dotenv";
dotenv.config();

import { Octokit } from "octokit";

console.log("GitHub Token loaded:", process.env.GITHUB_TOKEN ? "Yes (length: " + process.env.GITHUB_TOKEN.length + ")" : "No");
console.log("GitHub Username:", process.env.GITHUB_USERNAME);

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

/**
 * Creates a GitHub repository and deploys the app
 * @param {Object} params - Deployment parameters
 * @param {string} params.task - Task ID
 * @param {number} params.round - Round number
 * @param {Object} params.generatedCode - Generated code files
 * @param {string} params.brief - App brief
 * @param {Array} params.checks - Validation checks
 * @returns {Object} Deployment result with URLs and commit SHA
 */
export async function createAndDeployRepo({
  task,
  round,
  generatedCode,
  brief,
  checks,
}) {
  // Create unique repo name based on task
  const repoName = `${task}-r${round}`;

  try {
    // Step 1: Create repository
    console.log(`Creating repository: ${repoName}`);
    const repo = await createRepository(repoName);
    console.log(`✓ Repository created: ${repo.html_url}`);

    // Step 2: Add MIT LICENSE
    console.log("Adding MIT LICENSE...");
    await addFile(repoName, "LICENSE", getMITLicense(), "Add MIT LICENSE");
    console.log("✓ LICENSE added");

    // Step 3: Create README.md
    console.log("Creating README.md...");
    const readme = generateReadme({ task, round, brief, checks, repoName });
    await addFile(repoName, "README.md", readme, "Add README.md");
    console.log("✓ README.md added");

    // Step 4: Add generated code files
    console.log("Adding generated code...");
    for (const [filename, content] of Object.entries(generatedCode)) {
      await addFile(repoName, filename, content, `Add ${filename}`);
      console.log(`✓ ${filename} added`);
    }

    // Step 5: Enable GitHub Pages
    console.log("Enabling GitHub Pages...");
    await enableGitHubPages(repoName);
    console.log("✓ GitHub Pages enabled");

    // Step 6: Get the latest commit SHA
    const commitSha = await getLatestCommitSha(repoName);

    // Step 7: Construct URLs
    const repo_url = `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    const pages_url = `https://${GITHUB_USERNAME}.github.io/${repoName}/`;

    // Wait a bit for Pages to deploy
    console.log("Waiting for Pages to deploy...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return {
      repo_url,
      commit_sha: commitSha,
      pages_url,
    };
  } catch (error) {
    console.error("Error in GitHub deployment:", error.message);
    throw error;
  }
}

/**
 * Creates a new GitHub repository
 * @param {string} name - Repository name
 * @returns {Object} Repository object
 */
async function createRepository(name) {
  try {
    const { data } = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      description: `Generated app for task: ${name}`,
      private: false,
      auto_init: true,
    });
    return data;
  } catch (error) {
    if (error.status === 422) {
      // Repository might already exist, try to get it
      console.log("Repository might exist, attempting to use existing one...");
      const { data } = await octokit.rest.repos.get({
        owner: GITHUB_USERNAME,
        repo: name,
      });
      return data;
    }
    throw error;
  }
}

/**
 * Adds or updates a file in the repository
 * @param {string} repo - Repository name
 * @param {string} path - File path
 * @param {string} content - File content
 * @param {string} message - Commit message
 */
async function addFile(repo, path, content, message) {
  try {
    // Check if file exists
    let sha;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: GITHUB_USERNAME,
        repo,
        path,
      });
      sha = data.sha;
    } catch (error) {
      // File doesn't exist, that's fine
    }

    // Create or update file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_USERNAME,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    });
  } catch (error) {
    console.error(`Error adding file ${path}:`, error.message);
    throw error;
  }
}

/**
 * Enables GitHub Pages for the repository
 * @param {string} repo - Repository name
 */
async function enableGitHubPages(repo) {
  try {
    await octokit.rest.repos.createPagesSite({
      owner: GITHUB_USERNAME,
      repo,
      source: {
        branch: "main",
        path: "/",
      },
    });
  } catch (error) {
    if (error.status === 409) {
      console.log("GitHub Pages already enabled");
      return;
    }
    console.error("Error enabling GitHub Pages:", error.message);
    // Don't throw - Pages might already be enabled or will auto-enable
  }
}

/**
 * Gets the latest commit SHA from the repository
 * @param {string} repo - Repository name
 * @returns {string} Commit SHA
 */
async function getLatestCommitSha(repo) {
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner: GITHUB_USERNAME,
      repo,
      per_page: 1,
    });
    return data[0].sha;
  } catch (error) {
    console.error("Error getting commit SHA:", error.message);
    throw error;
  }
}

/**
 * Returns MIT License text
 * @returns {string} MIT License text
 */
function getMITLicense() {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year} ${GITHUB_USERNAME}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
}

/**
 * Generates README.md content
 * @param {Object} params - README parameters
 * @returns {string} README content
 */
function generateReadme({ task, round, brief, checks, repoName }) {
  return `# ${repoName}

## Overview

This is an automatically generated web application created for **${task}** (Round ${round}).

## Description

${brief}

## Features

This application implements the following requirements:

${checks.map((check, idx) => `${idx + 1}. ${check}`).join("\n")}

## Setup

This is a static web application that requires no build process.

### Running Locally

1. Clone this repository:
   \`\`\`bash
   git clone https://github.com/${GITHUB_USERNAME}/${repoName}.git
   cd ${repoName}
   \`\`\`

2. Open \`index.html\` in your web browser, or serve it with a simple HTTP server:
   \`\`\`bash
   python -m http.server 8000
   # or
   npx serve .
   \`\`\`

3. Navigate to \`http://localhost:8000\`

## Live Demo

This application is deployed on GitHub Pages: [View Live Demo](https://${GITHUB_USERNAME}.github.io/${repoName}/)

## Code Explanation

### Structure

- **index.html**: The main HTML file containing the entire application
  - Includes Bootstrap 5 for styling (via CDN)
  - Embedded CSS for custom styling
  - Embedded JavaScript for application logic

### Key Components

The application is built as a single-page application (SPA) with:
- Responsive design using Bootstrap
- Client-side JavaScript for dynamic functionality
- External library integration via CDN links

### How It Works

The application follows these steps:
1. Loads necessary libraries from CDN
2. Initializes the user interface
3. Handles user interactions
4. Processes data according to the task requirements
5. Displays results dynamically

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Additional libraries as needed (loaded via CDN)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Metadata

- **Task ID**: ${task}
- **Round**: ${round}
- **Generated**: ${new Date().toISOString()}
- **Generator**: LLM-assisted code generation system

---

*This application was automatically generated using AI-assisted development tools.*`;
}

/**
 * Updates an existing repository with new code (for round 2+)
 * @param {Object} params - Update parameters
 * @returns {Object} Update result
 */
export async function updateRepository({
  task,
  round,
  generatedCode,
  brief,
  checks,
}) {
  const repoName = `${task.split("-r")[0]}-r${round}`;

  try {
    console.log(`Updating repository: ${repoName}`);

    // Update code files
    for (const [filename, content] of Object.entries(generatedCode)) {
      await addFile(
        repoName,
        filename,
        content,
        `Update ${filename} for round ${round}`
      );
      console.log(`✓ ${filename} updated`);
    }

    // Update README
    const readme = generateReadme({ task, round, brief, checks, repoName });
    await addFile(
      repoName,
      "README.md",
      readme,
      `Update README for round ${round}`
    );
    console.log("✓ README.md updated");

    // Get latest commit
    const commitSha = await getLatestCommitSha(repoName);

    const repo_url = `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    const pages_url = `https://${GITHUB_USERNAME}.github.io/${repoName}/`;

    return {
      repo_url,
      commit_sha: commitSha,
      pages_url,
    };
  } catch (error) {
    console.error("Error updating repository:", error.message);
    throw error;
  }
}
