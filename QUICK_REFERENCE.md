# Quick Reference: New Utilities & Hooks

## Theme Utilities
```tsx
import { 
  getGroupTheme,           // (group) → { text, bg, border }
  getGroupTextStyle,       // (group) → { color }
  getStatusColor,          // (status) → '#color'
  getStatusLabel,          // (status) → 'inne' | 'ute' | 'hjemme'
  getStatusDescription     // (name, status) → string
} from '@/services/utils/theme';
```

## Date Utilities
```tsx
import {
  toDateKey,               // (iso) → '2025-12-12'
  getTodayKey,             // () → '2025-12-12'
  formatDateLabel,         // ('2025-12-12') → 'Fredag 12. desember'
  getDateLabel,            // () → 'Fredag 12. desember 2025'
  compareDateKeys,         // (a, b) → -1 | 0 | 1
  sortDatesDescending      // ([dates]) → [sorted]
} from '@/services/utils/date';
```

## Filter Utilities
```tsx
import {
  filterActivities,               // (activities, group, date) → Activity[]
  getActivityGroups,              // (activities) → string[]
  getChildGroups,                 // (children) → string[]
  getAvailableDatesForGroup,      // (activities, group) → string[]
  getAvailableDates,              // (activities) → string[]
  filterChildrenByGroup,          // (children, group) → Child[]
  sortChildrenAlphabetically,     // (children) → Child[]
  sortActivitiesByDateDescending  // (activities) → Activity[]
} from '@/services/utils/filters';
```

## Normalization Utilities
```tsx
import {
  normalizeGroupKey,     // (name) → 'bla' | 'rod'
  normalizeGroupLabel,   // (input) → 'Blå' | 'Rød'
  groupsEqual,           // (a, b) → boolean
  cleanText,             // (value) → string (no HTML)
  sanitizeUrl,           // (url) → string
  isValidEmail,          // (email) → boolean
  isValidPhone           // (phone) → boolean
} from '@/services/utils/normalization';
```

## Custom Hooks
```tsx
// Load children for current user
const { children, loading, error, refetch } = useChildren(userRole, parentId);

// Load activities with filtering & pagination
const {
  activities,        // Filtered activities
  allActivities,     // All loaded
  groups,            // Available groups
  availableDates,    // Available dates for selected group
  loading,
  error,
  refreshing,
  loadMore,
  refresh,
  loadingMore,
  hasMore
} = useActivities({
  userRole,
  parentId,
  children,
  group,
  date,
  pageSize: 10
});

// Generic pagination
const {
  offset,
  total,
  loadingMore,
  pageSize,
  reset,
  advance,
  setLoadingState,
  setTotalCount,
  hasMore,
  canLoadMore
} = usePagination(10);
```

## Migration Checklist

### For Each Screen Using Activities:

- [ ] Remove manual `useState` for `activities`, `loading`, `offset`, etc.
- [ ] Add `useActivities` hook with proper options
- [ ] Replace `getGroupTheme()` calls with import from theme.ts
- [ ] Replace `toDateKey()` calls with import from date.ts
- [ ] Replace `formatDateLabel()` calls with import from date.ts
- [ ] Replace filter logic with `filterActivities()` or use hook's filtered results
- [ ] Remove duplicated helper functions

### For Each Screen Using Children:

- [ ] Replace manual fetch with `useChildren()` hook
- [ ] Remove useState for loading/error
- [ ] Update logic to use hook's `children`, `loading`, `error`

## File Imports Template

```tsx
// For activities screen
import { useActivities } from '@/services/hooks/useActivities';
import { useChildren } from '@/services/hooks/useChildren';
import {
  formatDateLabel,
  toDateKey,
  getTodayKey,
} from '@/services/utils/date';
import {
  getGroupTheme,
  getStatusLabel,
  getStatusColor,
} from '@/services/utils/theme';
import {
  filterActivities,
  getAvailableDatesForGroup,
  sortActivitiesByDateDescending,
} from '@/services/utils/filters';
import { normalizeGroupLabel } from '@/services/utils/normalization';
```

## Performance Notes

✅ All utility functions are pure (no side effects)
✅ Hooks use `useCallback` for stable references
✅ `useMemo` used in `useActivities` for memoized groups/dates
✅ Pagination is server-side (FlatList onEndReached)
✅ Filtering happens client-side after load (fast)

## Testing

Since utilities are pure functions, they're easy to test:

```tsx
// Example test
import { getGroupTheme, normalizeGroupLabel } from '@/services/utils';

test('getGroupTheme returns correct colors for Blå', () => {
  expect(getGroupTheme('Blå gruppe')).toEqual({
    text: '#2563EB',
    bg: '#DBEAFE',
    border: '#93C5FD'
  });
});

test('normalizeGroupLabel handles variations', () => {
  expect(normalizeGroupLabel('blå')).toBe('Blå');
  expect(normalizeGroupLabel('Blå gruppe')).toBe('Blå');
  expect(normalizeGroupLabel('BLÅ')).toBe('Blå');
});
```
