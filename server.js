import express from "express";
import { validateRequest, verifySecret } from "./lib/validator.js";
import { generateApp } from "./lib/generator.js";
import { createAndDeployRepo } from "./lib/github.js";
import { notifyEvaluator } from "./lib/evaluator.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "LLM Code Deployment API",
    email: process.env.STUDENT_EMAIL,
  });
});

// Main endpoint to receive task requests
app.post("/api/build", async (req, res) => {
  try {
    console.log("\n=== Received Build Request ===");
    console.log("Email:", req.body.email);
    console.log("Task:", req.body.task);
    console.log("Round:", req.body.round);

    // STEP 1: Validate request structure
    const validation = validateRequest(req.body);
    if (!validation.valid) {
      console.error("Validation failed:", validation.errors);
      return res.status(400).json({
        error: "Invalid request",
        details: validation.errors,
      });
    }

    // STEP 2: Verify secret
    if (!verifySecret(req.body.secret)) {
      console.error("Secret verification failed");
      return res.status(403).json({ error: "Invalid secret" });
    }

    // STEP 3: Send 200 response immediately
    res.status(200).json({
      status: "accepted",
      message: "Request received and processing started",
      task: req.body.task,
      round: req.body.round,
    });

    // STEP 4: Process asynchronously (don't block response)
    processRequest(req.body).catch((err) => {
      console.error("Error processing request:", err);
    });
  } catch (error) {
    console.error("Error handling request:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Process the request asynchronously
async function processRequest(requestData) {
  const {
    email,
    task,
    round,
    nonce,
    brief,
    checks,
    evaluation_url,
    attachments,
  } = requestData;

  try {
    console.log("\n=== Starting App Generation ===");

    // STEP 5: Generate app using LLM
    const generatedCode = await generateApp({
      brief,
      checks,
      attachments,
      task,
      round,
    });

    console.log("✓ App generated successfully");
    console.log("\n=== Creating GitHub Repository ===");

    // STEP 6: Create repo and deploy to GitHub Pages
    const deployResult = await createAndDeployRepo({
      task,
      round,
      generatedCode,
      brief,
      checks,
    });

    console.log("✓ Repository created:", deployResult.repo_url);
    console.log("✓ Commit SHA:", deployResult.commit_sha);
    console.log("✓ Pages URL:", deployResult.pages_url);

    console.log("\n=== Notifying Evaluator ===");

    // STEP 7: Notify evaluator
    const notifyResult = await notifyEvaluator({
      email,
      task,
      round,
      nonce,
      repo_url: deployResult.repo_url,
      commit_sha: deployResult.commit_sha,
      pages_url: deployResult.pages_url,
      evaluation_url,
    });

    if (notifyResult.success) {
      console.log("✓ Evaluator notified successfully");
    } else {
      console.error("✗ Failed to notify evaluator:", notifyResult.error);
    }

    console.log("\n=== Process Complete ===\n");
  } catch (error) {
    console.error("\n✗ Error in processing:", error.message);
    console.error(error.stack);
  }
}

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Configured for: ${process.env.STUDENT_EMAIL}`);
  console.log(`👤 GitHub user: ${process.env.GITHUB_USERNAME}\n`);
});
