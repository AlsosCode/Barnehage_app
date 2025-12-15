/**
 * Date utility functions for consistent formatting across the app
 */

/**
 * Convert ISO date string to YYYY-MM-DD format
 * @param iso ISO date string (e.g., "2025-12-12T10:30:00Z")
 * @returns Date key in format YYYY-MM-DD
 */
export function toDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Get today's date key
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayKey(): string {
  return toDateKey(new Date().toISOString());
}

/**
 * Format date key to human-readable label in Norwegian
 * @param key Date in YYYY-MM-DD format
 * @returns Localized label (e.g., "I dag", "Mandag 12. desember")
 */
export function formatDateLabel(key: string): string {
  const todayKey = getTodayKey();
  if (key === todayKey) return 'I dag';
  
  const d = new Date(key);
  try {
    return d.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return d.toDateString();
  }
}

/**
 * Format full date with year for headers
 * @returns Full date string (e.g., "Fredag 12. desember 2025")
 */
export function getDateLabel(): string {
  const date = new Date();
  try {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date.toDateString();
  }
}

/**
 * Compare two date keys
 * @param a First date (YYYY-MM-DD)
 * @param b Second date (YYYY-MM-DD)
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareDateKeys(a: string, b: string): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Sort date keys in descending order (newest first)
 * @param dates Array of dates in YYYY-MM-DD format
 * @returns Sorted array
 */
export function sortDatesDescending(dates: string[]): string[] {
  return dates.sort((a, b) => b.localeCompare(a));
}
