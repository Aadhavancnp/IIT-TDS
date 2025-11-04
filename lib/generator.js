/**
 * Generates app code using AI Pipe (OpenRouter/OpenAI)
 * FREE for study.iitm.ac.in emails: $2/month limit
 * @param {Object} params - Generation parameters
 * @param {string} params.brief - App brief description
 * @param {Array} params.checks - Array of checks to validate
 * @param {Array} params.attachments - Array of attachments with data URIs
 * @param {string} params.task - Task ID
 * @param {number} params.round - Round number
 * @returns {Object} Generated code object with HTML, CSS, JS
 */
export async function generateApp({ brief, checks, attachments, task, round }) {
  console.log("Generating app with AI Pipe...");

  // Build the prompt
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt({
    brief,
    checks,
    attachments,
    task,
    round,
  });

  try {
    // Use AI Pipe with OpenRouter (free $2/month for study.iitm.ac.in)
    const response = await fetch(
      "https://aipipe.org/openrouter/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIPIPE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // Cost-effective model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Pipe API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the response to extract HTML code
    const code = parseCodeFromResponse(generatedContent);

    return code;
  } catch (error) {
    console.error("Error calling AI Pipe API:", error.message);

    // Check if it's a rate limit error
    if (error.message.includes("429") || error.message.includes("rate limit")) {
      throw new Error(
        "AI Pipe monthly limit ($2) exceeded. Please wait until next month or contact instructors."
      );
    }

    throw new Error(`Failed to generate app: ${error.message}`);
  }
}

/**
 * Builds the system prompt for the LLM
 * @returns {string} System prompt
 */
function buildSystemPrompt() {
  return `You are an expert web developer who creates minimal, functional single-page web applications.

Your task is to generate a complete HTML file (with embedded CSS and JavaScript) based on the user's requirements.

Requirements:
- Create a single, self-contained HTML file with embedded <style> and <script> tags
- Use only CDN links for external libraries (Bootstrap, jQuery, etc.) - NO npm packages
- Follow modern web development best practices
- Make the app functional and responsive
- Ensure all specified IDs and classes are present in the HTML
- Include proper error handling
- Keep the code clean, minimal, and well-commented
- The HTML should be production-ready and work immediately when opened in a browser

Output format:
- Return ONLY the complete HTML code
- Do not include markdown code blocks or explanations
- Start directly with <!DOCTYPE html>`;
}

/**
 * Builds the user prompt with task details
 * @param {Object} params - Prompt parameters
 * @returns {string} User prompt
 */
function buildUserPrompt({ brief, checks, attachments, task, round }) {
  let prompt = `Create a single-page web application with the following requirements:\n\n`;

  prompt += `BRIEF:\n${brief}\n\n`;

  if (checks && checks.length > 0) {
    prompt += `VALIDATION CHECKS:\n`;
    checks.forEach((check, idx) => {
      prompt += `${idx + 1}. ${check}\n`;
    });
    prompt += "\n";
  }

  if (attachments && attachments.length > 0) {
    prompt += `ATTACHMENTS:\n`;
    attachments.forEach((att, idx) => {
      prompt += `${idx + 1}. ${att.name}\n`;
      prompt += `   Data URI: ${att.url.substring(0, 100)}...\n`;
    });
    prompt += "\n";
  }

  prompt += `IMPORTANT:\n`;
  prompt += `- This is round ${round} for task "${task}"\n`;
  prompt += `- Create a fully functional, self-contained HTML file\n`;
  prompt += `- Use CDN links for any external libraries\n`;
  prompt += `- Ensure all checks can pass\n`;
  prompt += `- Include Bootstrap 5 for styling (via CDN)\n`;
  prompt += `- Make it visually appealing and user-friendly\n\n`;

  prompt += `Return ONLY the complete HTML code (no markdown formatting).`;

  return prompt;
}

/**
 * Parses code from LLM response
 * @param {string} response - Raw LLM response
 * @returns {Object} Parsed code object
 */
function parseCodeFromResponse(response) {
  // Remove markdown code blocks if present
  let html = response.trim();

  if (html.startsWith("```html")) {
    html = html.replace(/^```html\n/, "").replace(/\n```$/, "");
  } else if (html.startsWith("```")) {
    html = html.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  // Ensure we have valid HTML
  if (!html.includes("<!DOCTYPE html>") && !html.includes("<html>")) {
    throw new Error("Generated code is not valid HTML");
  }

  return {
    "index.html": html,
  };
}

/**
 * Decodes a data URI to get the actual content
 * @param {string} dataUri - Data URI string
 * @returns {string} Decoded content
 */
export function decodeDataUri(dataUri) {
  try {
    const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      const base64Data = matches[2];
      return Buffer.from(base64Data, "base64").toString("utf-8");
    }
    return "";
  } catch (error) {
    console.error("Error decoding data URI:", error);
    return "";
  }
}
