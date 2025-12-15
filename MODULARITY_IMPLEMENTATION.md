# Modularity Implementation Guide

## What Was Created

### ✅ Utility Modules (Frontend)

#### 1. `services/utils/theme.ts`
**Purpose**: Centralized theme and color logic

**Functions**:
- `getGroupTheme(group)` - Get colors for Blå/Rød groups
- `getGroupTextStyle(group)` - Get style object for text
- `getStatusColor(status)` - Get color for child status
- `getStatusLabel(status)` - Get "inne" | "ute" | "hjemme"
- `getStatusDescription(name, status)` - Get full description

**Usage**:
```tsx
import { getGroupTheme, getStatusLabel } from '@/services/utils/theme';

const theme = getGroupTheme('Blå gruppe');
// { text: '#2563EB', bg: '#DBEAFE', border: '#93C5FD' }

const label = getStatusLabel('checked_in'); // 'inne'
```

#### 2. `services/utils/date.ts`
**Purpose**: Consistent date formatting

**Functions**:
- `toDateKey(iso)` - Convert "2025-12-12T10:30:00Z" → "2025-12-12"
- `getTodayKey()` - Get today's date key
- `formatDateLabel(key)` - "2025-12-12" → "Fredag 12. desember"
- `getDateLabel()` - Get full date with year for headers
- `sortDatesDescending(dates)` - Sort newest first

**Usage**:
```tsx
import { toDateKey, formatDateLabel, getDateLabel } from '@/services/utils/date';

const dateKey = toDateKey(activity.createdAt);
const label = formatDateLabel(dateKey); // "I dag" or "Fredag 12. desember"
const headerDate = getDateLabel(); // "Fredag 12. desember 2025"
```

#### 3. `services/utils/filters.ts`
**Purpose**: Data filtering and sorting

**Functions**:
- `filterActivities(activities, group, date)` - Filter by group and/or date
- `getActivityGroups(activities)` - Get unique groups
- `getChildGroups(children)` - Get unique groups from children
- `getAvailableDatesForGroup(activities, group)` - Get dates for a group
- `filterChildrenByGroup(children, group)` - Filter children
- `sortChildrenAlphabetically(children)` - Sort by name
- `sortActivitiesByDateDescending(activities)` - Sort newest first

**Usage**:
```tsx
import {
  filterActivities,
  getAvailableDatesForGroup,
  sortActivitiesByDateDescending,
} from '@/services/utils/filters';

const filtered = filterActivities(activities, 'Blå', '2025-12-12');
const dates = getAvailableDatesForGroup(activities, 'Blå');
const sorted = sortActivitiesByDateDescending(activities);
```

#### 4. `services/utils/normalization.ts`
**Purpose**: Text normalization and validation

**Functions**:
- `normalizeGroupKey(name)` - "Blå" → "bla" (for comparison)
- `normalizeGroupLabel(input)` - "blå gruppe" → "Blå" (for display)
- `groupsEqual(a, b)` - Check if two groups are the same
- `cleanText(value)` - Remove HTML/script tags
- `sanitizeUrl(url)` - Safe URL
- `isValidEmail(email)` - Validate email
- `isValidPhone(phone)` - Validate phone (Norwegian format)

**Usage**:
```tsx
import { normalizeGroupLabel, groupsEqual } from '@/services/utils/normalization';

const displayName = normalizeGroupLabel('blå gruppe'); // "Blå"
const same = groupsEqual('Blå', 'blå gruppe'); // true
```

---

### ✅ Custom Hooks (Frontend)

#### 1. `services/hooks/useChildren.ts`
**Purpose**: Manage children data loading with auth filtering

**Returns**:
```tsx
{
  children: Child[];
  loading: boolean;
  error: string | null;
  refetch: (signal?: AbortSignal) => Promise<void>;
}
```

**Usage**:
```tsx
import { useChildren } from '@/services/hooks/useChildren';
import { useAuth } from '@/contexts/AuthContext';

export default function MyScreen() {
  const { userRole, parentId } = useAuth();
  const { children, loading, error, refetch } = useChildren(userRole, parentId);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return (
    <ScrollView>
      {children.map(child => (
        <Text key={child.id}>{child.name}</Text>
      ))}
    </ScrollView>
  );
}
```

#### 2. `services/hooks/useActivities.ts`
**Purpose**: Complete activities management (data, pagination, filtering)

**Returns**:
```tsx
{
  activities: Activity[];           // Filtered activities
  allActivities: Activity[];        // All loaded activities
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadMore: () => Promise<void>;   // Load next page
  refresh: () => Promise<void>;    // Reload from start
  loadingMore: boolean;
  groups: string[];                // Available groups
  availableDates: string[];        // Available dates for selected group
  hasMore: boolean;
}
```

**Usage**:
```tsx
import { useActivities } from '@/services/hooks/useActivities';
import { useAuth } from '@/contexts/AuthContext';

export default function ActivitiesScreen() {
  const { userRole, parentId } = useAuth();
  const { children } = useChildren(userRole, parentId);
  
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const {
    activities,
    groups,
    availableDates,
    loading,
    loadMore,
    refresh,
    refreshing,
    hasMore,
  } = useActivities({
    userRole,
    parentId,
    children,
    group: selectedGroup,
    date: selectedDate,
    pageSize: 10,
  });

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <ActivityCard activity={item} />}
      ListHeaderComponent={
        <View>
          <Chips 
            items={groups} 
            selected={selectedGroup}
            onSelect={setSelectedGroup}
          />
          {selectedGroup && (
            <Chips
              items={availableDates.map(formatDateLabel)}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
          )}
        </View>
      }
      onEndReached={loadMore}
      refreshing={refreshing}
      onRefresh={refresh}
    />
  );
}
```

#### 3. `services/hooks/usePagination.ts`
**Purpose**: Generic pagination state management

**Returns**:
```tsx
{
  offset: number;
  total: number | undefined;
  loadingMore: boolean;
  pageSize: number;
  reset: () => void;
  advance: (count: number) => void;
  setLoadingState: (loading: boolean) => void;
  setTotalCount: (count: number | undefined) => void;
  hasMore: boolean;
  canLoadMore: boolean;
}
```

**Usage**:
```tsx
// Already used internally by useActivities, but available if needed
const pagination = usePagination(10);

if (pagination.canLoadMore) {
  // Load next page
}
```

---

## How to Update Existing Screens

### Before: `index.tsx` (200+ lines)
```tsx
const [activities, setActivities] = useState<Activity[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
// ... 20 more useState calls and callbacks
```

### After: `index.tsx` (30 lines for data management)
```tsx
import { useChildren } from '@/services/hooks/useChildren';
import { useActivities } from '@/services/hooks/useActivities';

export default function HomeScreen() {
  const { userRole, parentId } = useAuth();
  
  // All data management in 2 hooks!
  const { children, loading: childLoading } = useChildren(userRole, parentId);
  const { activities, loading: activitiesLoading } = useActivities({
    userRole,
    parentId,
    children,
  });

  if (childLoading || activitiesLoading) return <ActivityIndicator />;

  // Render with activities and children
}
```

---

## Next Steps (Recommended)

### Phase 3: Create Shared Components
- `components/shared/GroupPill.tsx` - Group badge
- `components/shared/ActivityCard.tsx` - Activity display
- `components/shared/ChildCard.tsx` - Child status card
- `components/shared/FilterChips.tsx` - Filter chips UI

### Phase 4: Refactor Screens
- Update `index.tsx` to use hooks + shared components
- Update `activities.tsx` to use hooks + shared components
- Remove duplicated logic

### Phase 5: Backend Modularity
- Extract `clean()` to `routes/utils/clean.js`
- Extract `normalizeGroupLabel()` to `routes/utils/groupNormalization.js`
- Create error handler middleware
- Create validation helpers

---

## Benefits Achieved

✅ **DRY**: No duplicate theme, date, filter logic
✅ **Reusable**: Use same utilities everywhere
✅ **Testable**: Pure functions easy to test
✅ **Maintainable**: Change logic in one place
✅ **Scalable**: Add new screens with 30 lines (not 200+)
✅ **Consistent**: Same formatting, colors, behavior everywhere

---

## Current Status

✅ Phase 1: Utilities created (4 files)
✅ Phase 2: Custom hooks created (3 files)
⏳ Phase 3: Shared components (not started)
⏳ Phase 4: Screen refactoring (not started)
⏳ Phase 5: Backend utilities (not started)
