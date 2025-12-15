/**
 * Child status enumeration
 */
export enum ChildStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  HOME = 'home',
}

/**
 * Status labels in Norwegian
 */
export const STATUS_LABELS: Record<ChildStatus, 'inne' | 'ute' | 'hjemme'> = {
  [ChildStatus.CHECKED_IN]: 'inne',
  [ChildStatus.CHECKED_OUT]: 'ute',
  [ChildStatus.HOME]: 'hjemme',
};

/**
 * Status descriptions in Norwegian
 */
export const STATUS_DESCRIPTIONS: Record<ChildStatus, (childName: string) => string> = {
  [ChildStatus.CHECKED_IN]: (name) => `${name} er for tiden i barnehagen.`,
  [ChildStatus.CHECKED_OUT]: (name) => `${name} er ikke sjekket inn.`,
  [ChildStatus.HOME]: (name) => `${name} er meldt hjemme i dag.`,
};
