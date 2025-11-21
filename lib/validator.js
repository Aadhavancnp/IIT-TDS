/**
 * Request Validator
 * Validates incoming quiz requests and verifies secrets
 */

const STUDENT_EMAIL = process.env.STUDENT_EMAIL;
const STUDENT_SECRET = process.env.STUDENT_SECRET;

export function validateRequest(body) {
  // Check for invalid JSON (should be caught by express already)
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      status: 400,
      error: 'Invalid JSON payload'
    };
  }

  // Check required fields
  const { email, secret, url } = body;

  if (!email || !secret || !url) {
    return {
      valid: false,
      status: 400,
      error: 'Missing required fields: email, secret, url'
    };
  }

  // Validate email format
  if (typeof email !== 'string' || !email.includes('@')) {
    return {
      valid: false,
      status: 400,
      error: 'Invalid email format'
    };
  }

  // Validate URL format
  if (typeof url !== 'string' || !url.startsWith('http')) {
    return {
      valid: false,
      status: 400,
      error: 'Invalid URL format'
    };
  }

  // Verify secret matches
  if (secret !== STUDENT_SECRET) {
    return {
      valid: false,
      status: 403,
      error: 'Invalid secret'
    };
  }

  // Verify email matches
  if (email !== STUDENT_EMAIL) {
    return {
      valid: false,
      status: 403,
      error: 'Email does not match registered student'
    };
  }

  return {
    valid: true,
    status: 200
  };
}
