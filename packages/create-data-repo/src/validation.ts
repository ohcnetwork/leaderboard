/**
 * Validation functions for user inputs
 */

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean | string {
  if (!url) return "URL is required";
  try {
    new URL(url);
    return true;
  } catch {
    return "Invalid URL format (e.g., https://example.com)";
  }
}

/**
 * Validate optional URL (can be empty)
 */
export function validateOptionalUrl(url: string): boolean | string {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return "Invalid URL format (e.g., https://example.com)";
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean | string {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return "Date must be in YYYY-MM-DD format (e.g., 2020-03-15)";
  }
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return "Invalid date";
  }
  return true;
}

/**
 * Validate optional date
 */
export function validateOptionalDate(date: string): boolean | string {
  if (!date) return true;
  return validateDate(date);
}

/**
 * Validate slug format (lowercase, alphanumeric, hyphens, underscores)
 */
export function validateSlug(slug: string): boolean | string {
  if (!slug) return "Slug is required";
  if (!/^[a-z][a-z0-9_-]*$/.test(slug)) {
    return "Slug must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores";
  }
  return true;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean | string {
  if (!email) return true; // Optional field
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Invalid email format (e.g., support@example.com)";
  }
  return true;
}

/**
 * Validate required text field
 */
export function validateRequired(value: string): boolean | string {
  if (!value || value.trim().length === 0) {
    return "This field is required";
  }
  return true;
}

/**
 * Extract organization name from GitHub URL
 */
export function extractOrgFromGithubUrl(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter((p) => p);
    if (parts.length > 0) {
      return parts[0];
    }
  } catch {
    // Invalid URL
  }
  return null;
}
