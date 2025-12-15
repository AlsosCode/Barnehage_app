/**
 * Group definitions with colors and metadata
 */
export const GROUP_DEFINITIONS = {
  bla: {
    id: 'bla',
    displayName: 'Blå gruppe',
    keywords: ['blå', 'bla', 'blue'],
    colors: {
      text: '#2563EB',
      bg: '#DBEAFE',
      border: '#93C5FD',
    },
  },
  rod: {
    id: 'rod',
    displayName: 'Rød gruppe',
    keywords: ['rød', 'rod', 'roed', 'red'],
    colors: {
      text: '#DC2626',
      bg: '#FECACA',
      border: '#FCA5A5',
    },
  },
} as const;

export const DEFAULT_GROUP = {
  colors: {
    text: '#374151',
    bg: '#E5E7EB',
    border: '#D1D5DB',
  },
};

export type GroupKey = keyof typeof GROUP_DEFINITIONS;
