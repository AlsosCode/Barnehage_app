# Modularity Analysis & Improvements

## Current State Analysis

### 🟡 Issue Areas

#### 1. **Frontend Screens - Logic Duplication**
**Files**: `index.tsx`, `activities.tsx`
**Problems**:
- `getGroupTheme()` duplicated in both screens
- `toDateKey()`, `formatDateLabel()` duplicated
- Similar filtering logic (group + date)
- Pagination logic scattered

**Impact**: Hard to maintain, inconsistent behavior

#### 2. **Theme Usage - Not Fully Extracted**
**File**: `constants/theme.ts`
**Problems**:
- Only color values exported
- Utility functions (getGroupTheme) inline in components
- No centralized styling helpers

#### 3. **API Client - Good Start, Could be Modular**
**File**: `services/api.ts`
**Status**: ✅ Well-structured but could split by domain

#### 4. **Backend Routes - No Middleware/Utilities**
**Files**: `routes/*.js`
**Problems**:
- No shared error handling
- No validation layer
- Utility functions like `clean()` and `normalizeGroupLabel()` duplicated

#### 5. **State Management - No Custom Hooks**
**Issue**: Each screen implements its own data fetching, loading, filtering

---

## Recommended Architecture

```
my-app/
├── services/
│   ├── api/                 # ✅ Keep api.ts, add domain-specific modules
│   │   ├── index.ts         # Main export
│   │   ├── children.ts      # Children domain
│   │   ├── activities.ts    # Activities domain
│   │   ├── parents.ts       # Parents domain
│   │   └── core/
│   │       ├── apiCall.ts   # Base fetch wrapper
│   │       └── types.ts     # Shared types
│   │
│   ├── utils/               # NEW: Shared utilities
│   │   ├── theme.ts         # Theme helpers
│   │   ├── date.ts          # Date formatting
│   │   ├── filters.ts       # Filtering logic
│   │   └── normalization.ts # Group/text normalization
│   │
│   └── hooks/               # NEW: Custom React hooks
│       ├── useActivities.ts # Activities data + state
│       ├── useChildren.ts   # Children data + state
│       ├── usePagination.ts # Pagination logic
│       └── useGroupTheme.ts # Theme logic
│
├── components/
│   ├── ui/                  # ✅ Keep as-is
│   ├── shared/              # NEW: Reusable business components
│   │   ├── GroupPill.tsx    # Group badge with color
│   │   ├── ActivityCard.tsx # Activity display
│   │   ├── ChildCard.tsx    # Child status card
│   │   └── FilterChips.tsx  # Date/Group filter UI
│   │
│   └── media/               # ✅ Keep as-is
│
├── constants/               # ✅ Keep as-is
│
├── contexts/                # ✅ Keep as-is
│
├── app/(tabs)/              # Refactored screens
│   ├── index.tsx            # Simplified
│   ├── activities.tsx       # Simplified
│   └── ...
```

**Backend:**
```
routes/
├── middleware/              # NEW
│   ├── errorHandler.js
│   ├── validation.js
│   └── normalize.js
│
├── utils/                   # NEW
│   ├── clean.js
│   ├── groupNormalization.js
│   └── validators.js
│
└── controllers/             # NEW
    ├── children.js
    ├── activities.js
    ├── parents.js
    └── stats.js
```

---

## Implementation Plan

### Phase 1: Create Utility Modules (Frontend)

1. **`services/utils/theme.ts`** - Color & theme logic
2. **`services/utils/date.ts`** - Date formatting
3. **`services/utils/filters.ts`** - Activity/child filtering
4. **`services/utils/normalization.ts`** - Group normalization

### Phase 2: Create Custom Hooks (Frontend)

1. **`services/hooks/useActivities.ts`** - Complete activities data + state
2. **`services/hooks/useChildren.ts`** - Children data + state  
3. **`services/hooks/usePagination.ts`** - Pagination abstraction
4. **`services/hooks/useGroupTheme.ts`** - Color theme selection

### Phase 3: Create Reusable Components (Frontend)

1. **`components/shared/GroupPill.tsx`** - Show group with color
2. **`components/shared/ActivityCard.tsx`** - Activity display (extract from index.tsx)
3. **`components/shared/ChildCard.tsx`** - Child status (extract from index.tsx)
4. **`components/shared/FilterChips.tsx`** - Filter UI (extract from activities.tsx)

### Phase 4: Refactor Screens

1. **`index.tsx`** - Use `useActivities`, `useChildren`, shared components
2. **`activities.tsx`** - Use `useActivities`, shared components

### Phase 5: Backend Modularity

1. Extract `clean()`, `normalizeGroupLabel()` to `routes/utils/`
2. Create error handler middleware
3. Create validation helpers

---

## Benefits

✅ **Reusability**: Utility functions & components used across screens
✅ **Testability**: Logic isolated in pure functions & custom hooks
✅ **Maintainability**: Single source of truth for business logic
✅ **Scalability**: Easy to add new screens (reuse hooks + components)
✅ **Consistency**: Same theme, date, filter logic everywhere

---

## Example: How `useActivities` Simplifies Screens

### Before:
```tsx
const [activities, setActivities] = useState<Activity[]>([]);
const [loading, setLoading] = useState(true);
const [offset, setOffset] = useState(0);
const [loadingMore, setLoadingMore] = useState(false);
const [total, setTotal] = useState<number | undefined>(undefined);

const loadAll = useCallback(async () => {
  try {
    setLoading(true);
    const firstPage = await api.activities.getPage({ ... });
    setActivities(firstPage.items);
    setOffset(firstPage.offset + firstPage.items.length);
    setTotal(firstPage.total);
  } finally {
    setLoading(false);
  }
}, [...]); // 200+ lines for this screen
```

### After:
```tsx
const { 
  activities, 
  loading, 
  loadMore, 
  refresh,
  filteredActivities 
} = useActivities({ group: selectedGroup, date: selectedDate });

// That's it! The hook handles everything.
// 30 lines instead of 200+
```

---

## Estimate: 6-8 hours to implement
- Utilities: 1-2h
- Custom hooks: 2-3h
- Shared components: 2-3h
- Refactor screens: 1-2h
- Backend utils: 30min
