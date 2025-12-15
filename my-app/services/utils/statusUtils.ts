import { Palette } from '@/constants/theme';
import { ChildStatus, STATUS_LABELS, STATUS_DESCRIPTIONS } from '@/constants/statuses';

/**
 * Get status color based on child status
 * @param status Child status
 * @returns Color string
 */
export function getStatusColor(status: ChildStatus): string {
  switch (status) {
    case ChildStatus.CHECKED_IN:
      return Palette.statusIn;
    case ChildStatus.CHECKED_OUT:
      return Palette.statusOut;
    case ChildStatus.HOME:
      return Palette.statusHome;
    default:
      return Palette.border;
  }
}

/**
 * Get status label in Norwegian
 * @param status Child status
 * @returns Localized label
 */
export function getStatusLabel(status: ChildStatus): 'inne' | 'ute' | 'hjemme' {
  return STATUS_LABELS[status] || 'ute';
}

/**
 * Get extended status description
 * @param childName Child name
 * @param status Child status
 * @returns Localized description
 */
export function getStatusDescription(childName: string, status: ChildStatus): string {
  const descriptionFn = STATUS_DESCRIPTIONS[status];
  return descriptionFn ? descriptionFn(childName) : `${childName} status er ukjent.`;
}

/**
 * Validate if a string is a valid status
 * @param status Status string to validate
 * @returns True if valid status
 */
export function isValidStatus(status: unknown): status is ChildStatus {
  return Object.values(ChildStatus).includes(status as ChildStatus);
}

/**
 * Get all available statuses
 * @returns Array of all status values
 */
export function getAllStatuses(): ChildStatus[] {
  return Object.values(ChildStatus);
}

/**
 * Convert string to ChildStatus enum safely
 * @param status String status to convert
 * @returns ChildStatus or null if invalid
 */
export function toChildStatus(status: unknown): ChildStatus | null {
  if (isValidStatus(status)) {
    return status;
  }
  return null;
}
