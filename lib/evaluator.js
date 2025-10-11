/**
 * Notifies the evaluator with repository details
 * @param {Object} params - Notification parameters
 * @param {string} params.email - Student email
 * @param {string} params.task - Task ID
 * @param {number} params.round - Round number
 * @param {string} params.nonce - Nonce from request
 * @param {string} params.repo_url - Repository URL
 * @param {string} params.commit_sha - Commit SHA
 * @param {string} params.pages_url - GitHub Pages URL
 * @param {string} params.evaluation_url - Evaluation endpoint URL
 * @returns {Object} Result with success flag
 */
export async function notifyEvaluator({
  email,
  task,
  round,
  nonce,
  repo_url,
  commit_sha,
  pages_url,
  evaluation_url,
}) {
  const payload = {
    email,
    task,
    round,
    nonce,
    repo_url,
    commit_sha,
    pages_url,
  };

  console.log("Notifying evaluator at:", evaluation_url);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  // Try to POST with exponential backoff
  const maxAttempts = 5;
  const delays = [1000, 2000, 4000, 8000, 16000]; // 1s, 2s, 4s, 8s, 16s

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(evaluation_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(
          `✓ Evaluator notified successfully (attempt ${attempt + 1})`
        );
        const responseData = await response.text();
        return {
          success: true,
          attempt: attempt + 1,
          statusCode: response.status,
          response: responseData,
        };
      } else {
        console.warn(
          `✗ Evaluator returned status ${response.status} (attempt ${
            attempt + 1
          })`
        );

        // If not the last attempt, wait and retry
        if (attempt < maxAttempts - 1) {
          const delay = delays[attempt];
          console.log(`  Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error(
        `✗ Error notifying evaluator (attempt ${attempt + 1}):`,
        error.message
      );

      // If not the last attempt, wait and retry
      if (attempt < maxAttempts - 1) {
        const delay = delays[attempt];
        console.log(`  Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All attempts failed
  return {
    success: false,
    error: `Failed to notify evaluator after ${maxAttempts} attempts`,
    attempts: maxAttempts,
  };
}

/**
 * Validates that the evaluator notification was successful
 * @param {string} evaluation_url - Evaluation endpoint URL
 * @returns {Promise<boolean>} True if endpoint is reachable
 */
export async function checkEvaluatorEndpoint(evaluation_url) {
  try {
    const response = await fetch(evaluation_url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn("Evaluator endpoint check failed:", error.message);
    return false;
  }
}
