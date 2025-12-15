import { useCallback, useState, useEffect, useMemo } from 'react';
import api, { Activity, Child } from '@/services/api';
import {
  filterActivities,
  getActivityGroups,
  getAvailableDatesForGroup,
  sortActivitiesByDateDescending,
} from '@/services/utils/filters';
import { normalizeActivityForDisplay } from '@/services/utils/activityUtils';

interface UseActivitiesOptions {
  userRole?: string | null;
  parentId?: number | null;
  children?: Child[];
  group?: string | null;
  date?: string | null;
  pageSize?: number;
}

/**
 * Hook to manage activities data, pagination, filtering
 * Handles auth-based filtering (guests only see their children's groups)
 */
export function useActivities(options: UseActivitiesOptions = {}) {
  const {
    userRole,
    parentId,
    children = [],
    group,
    date,
    pageSize = 10,
  } = options;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load first page
  const loadAll = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        const firstPage = await api.activities.getPage({
          limit: pageSize,
          offset: 0,
          group: group ?? undefined,
          date: date ?? undefined,
        });

        if (signal?.aborted) return;

        let filtered = firstPage.items
          .map(normalizeActivityForDisplay)
          .filter((a): a is Activity => Boolean(a));

        // Filter for guests: only groups their kids belong to
        if (userRole === 'guest' && parentId != null && children.length > 0) {
          const allowedGroups = new Set(children.map((c) => c.group));
          filtered = firstPage.items.filter((a) => allowedGroups.has(a.group));
        }

        filtered = sortActivitiesByDateDescending(filtered);
        setActivities(filtered);
        setOffset((firstPage.offset ?? 0) + filtered.length);
        setTotal(firstPage.total);
      } catch (err) {
        if (signal?.aborted) return;
        console.error('Error fetching activities:', err);
        setError('Kunne ikke hente aktiviteter. Prøv igjen.');
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [userRole, parentId, children, group, date, pageSize]
  );

  // Load more for pagination
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (typeof total === 'number' && offset >= total) return;

    try {
      setLoadingMore(true);
      const page = await api.activities.getPage({
        limit: pageSize,
        offset,
        group: group ?? undefined,
        date: date ?? undefined,
      });

      if (!page.items) return;

      let items = page.items
        .map(normalizeActivityForDisplay)
        .filter((a): a is Activity => Boolean(a));
      if (userRole === 'guest' && parentId != null && children.length > 0) {
        const allowedGroups = new Set(children.map((c) => c.group));
        items = items.filter((a) => allowedGroups.has(a.group));
      }

      setActivities((prev) => [...prev, ...items]);
      setOffset((page.offset ?? offset) + items.length);
      setTotal(page.total);
    } catch (err) {
      console.error('Error loading more activities:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, offset, total, pageSize, group, date, userRole, parentId, children]);

  // Refresh (reload first page)
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  // Initial load on mount
  useEffect(() => {
    const controller = new AbortController();
    loadAll(controller.signal);
    return () => controller.abort();
  }, [loadAll]);

  // Memoize groups and dates based on current activities
  const groups = useMemo(() => {
    if (userRole === 'guest') {
      return Array.from(new Set(children.map((c) => c.group)));
    }
    return getActivityGroups(activities);
  }, [userRole, children, activities]);

  const availableDates = useMemo(() => {
    if (!group) return [];
    return getAvailableDatesForGroup(activities, group);
  }, [activities, group]);

  // Apply filters to activities
  const filteredActivities = useMemo(() => {
    return filterActivities(activities, group, date);
  }, [activities, group, date]);

  return {
    activities: filteredActivities,
    allActivities: activities,
    loading,
    error,
    refreshing,
    loadMore,
    refresh,
    loadingMore,
    groups,
    availableDates,
    hasMore: typeof total === 'number' ? offset < total : false,
  };
}
