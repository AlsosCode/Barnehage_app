/**
 * Text normalization utilities
 * Consistent across frontend and backend
 */

/**
 * Normalize group name for comparison
 * Converts "Blå", "Blå gruppe", "blå" all to normalized key
 * @param name Group name to normalize
 * @returns Normalized key (e.g., "bla", "rod")
 */
export function normalizeGroupKey(name: string | undefined): string {
  if (!name) return '';
  const val = String(name).toLowerCase();
  if (val.includes('blå')) return 'bla';
  if (val.includes('rød') || val.includes('rod')) return 'rod';
  return val.trim();
}

/**
 * Normalize group name for display
 * Converts various formats to "Blå" or "Rød"
 * @param input Group name input
 * @returns Display-friendly name (e.g., "Blå", "Rød")
 */
export function normalizeGroupLabel(input: string | undefined): string {
  const val = normalizeGroupKey(input);
  if (val === 'bla') return 'Blå';
  if (val === 'rod') return 'Rød';
  return cleanText(input) || 'Blå';
}

/**
 * Compare two group names for equality
 * @param a Group name A
 * @param b Group name B
 * @returns True if groups are the same (normalized)
 */
export function groupsEqual(a: string | undefined, b: string | undefined): boolean {
  return normalizeGroupKey(a) === normalizeGroupKey(b);
}

/**
 * Sanitize text input - remove HTML/script tags
 * @param value Text to clean
 * @returns Cleaned text
 */
export function cleanText(value: string | undefined): string {
  if (!value) return '';
  return String(value).trim().replace(/[<>]/g, '');
}

/**
 * Sanitize URL - remove dangerous characters
 * @param url URL to sanitize
 * @returns Safe URL
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  return cleanText(url);
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Norwegian format)
 * @param phone Phone to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+()]{8,}$/;
  return phoneRegex.test(phone);
}
