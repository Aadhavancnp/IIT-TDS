/**
 * Validates the incoming request structure
 * @param {Object} body - Request body
 * @returns {Object} Validation result with valid flag and errors array
 */
export function validateRequest(body) {
  const errors = [];
  const requiredFields = [
    "email",
    "secret",
    "task",
    "round",
    "nonce",
    "brief",
    "checks",
    "evaluation_url",
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate email format
  if (body.email && !isValidEmail(body.email)) {
    errors.push("Invalid email format");
  }

  // Validate round number
  if (body.round && (typeof body.round !== "number" || body.round < 1)) {
    errors.push("Round must be a positive number");
  }

  // Validate checks is an array
  if (body.checks && !Array.isArray(body.checks)) {
    errors.push("Checks must be an array");
  }

  // Validate evaluation_url format
  if (body.evaluation_url && !isValidUrl(body.evaluation_url)) {
    errors.push("Invalid evaluation_url format");
  }

  // Validate attachments if present
  if (body.attachments) {
    if (!Array.isArray(body.attachments)) {
      errors.push("Attachments must be an array");
    } else {
      body.attachments.forEach((att, idx) => {
        if (!att.name || !att.url) {
          errors.push(`Attachment ${idx} missing name or url`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifies if the provided secret matches the configured secret
 * @param {string} providedSecret - Secret from the request
 * @returns {boolean} True if secret matches
 */
export function verifySecret(providedSecret) {
  const configuredSecret = process.env.STUDENT_SECRET;

  if (!configuredSecret) {
    console.error("STUDENT_SECRET not configured in environment");
    return false;
  }

  return providedSecret === configuredSecret;
}

/**
 * Helper function to validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper function to validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
