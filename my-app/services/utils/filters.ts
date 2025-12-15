import { Activity, Child } from '@/services/api';
import { toDateKey } from './date';

/**
 * Filter activities by group and/or date
 * @param activities Array of activities
 * @param group Optional group name to filter by
 * @param date Optional date in YYYY-MM-DD format
 * @returns Filtered activities
 */
export function filterActivities(
  activities: Activity[],
  group?: string | null,
  date?: string | null
): Activity[] {
  return activities.filter(
    (a) =>
      (!group || a.group === group) &&
      (!date || toDateKey(a.createdAt) === date)
  );
}

/**
 * Get unique groups from activities
 * @param activities Array of activities
 * @returns Array of unique group names
 */
export function getActivityGroups(activities: Activity[]): string[] {
  return Array.from(new Set(activities.map((a) => a.group)));
}

/**
 * Get unique groups from children
 * @param children Array of children
 * @returns Array of unique group names
 */
export function getChildGroups(children: Child[]): string[] {
  return Array.from(new Set(children.map((c) => c.group)));
}

/**
 * Get available dates for a specific group in activities
 * @param activities Array of activities
 * @param group Group name to filter by
 * @returns Array of unique dates in YYYY-MM-DD format, sorted newest first
 */
export function getAvailableDatesForGroup(activities: Activity[], group: string): string[] {
  const keys = new Set<string>();
  activities.forEach((a) => {
    if (a.group === group) {
      keys.add(toDateKey(a.createdAt));
    }
  });
  return Array.from(keys).sort((a, b) => b.localeCompare(a));
}

/**
 * Get all unique dates from activities
 * @param activities Array of activities
 * @returns Array of unique dates in YYYY-MM-DD format, sorted newest first
 */
export function getAvailableDates(activities: Activity[]): string[] {
  const keys = new Set<string>();
  activities.forEach((a) => {
    keys.add(toDateKey(a.createdAt));
  });
  return Array.from(keys).sort((a, b) => b.localeCompare(a));
}

/**
 * Filter children by group
 * @param children Array of children
 * @param group Group name
 * @returns Filtered children
 */
export function filterChildrenByGroup(children: Child[], group: string): Child[] {
  return children.filter((c) => c.group === group);
}

/**
 * Sort children alphabetically
 * @param children Array of children
 * @returns Sorted array
 */
export function sortChildrenAlphabetically(children: Child[]): Child[] {
  return [...children].sort((a, b) => a.name.localeCompare(b.name, 'nb-NO'));
}

/**
 * Sort activities by creation date, newest first
 * @param activities Array of activities
 * @returns Sorted array
 */
export function sortActivitiesByDateDescending(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
