/**
 * Utility functions for user input sanitization to prevent XSS and injections.
 */

/**
 * Sanitizes a string input by removing HTML tags and replacing special characters.
 * @param input The raw input string from the user.
 * @returns A safe, sanitized string.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return m;
      }
    })
    .trim();
}

/**
 * Sanitizes numeric inputs.
 * @param input The raw input.
 * @param defaultValue Fallback value if input is invalid.
 * @returns A safe number.
 */
export function sanitizeNumber(input: any, defaultValue: number = 0): number {
  const parsed = Number(input);
  return isNaN(parsed) ? defaultValue : parsed;
}
