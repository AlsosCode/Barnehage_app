import { useCallback, useState, useEffect } from 'react';
import api, { Child } from '@/services/api';
import { normalizeChildForDisplay } from '@/services/utils/childUtils';

/**
 * Hook to manage children data loading and filtering
 * Handles auth-based filtering (admin sees all, guests see their own)
 */
export function useChildren(userRole?: string | null, parentId?: number | null) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const allChildren = await api.children.getAll();
        if (signal?.aborted) return;

        let relevant = allChildren;
        if (userRole === 'guest' && parentId != null) {
          relevant = allChildren.filter((child) => child.parentId === parentId);
        }

        relevant = [...relevant].sort((a, b) =>
          a.name.localeCompare(b.name, 'nb-NO')
        );

        if (signal?.aborted) return;
        const sanitized = relevant.map(normalizeChildForDisplay);
        setChildren(sanitized);
      } catch (err) {
        if (signal?.aborted) return;
        console.error('Error fetching children:', err);
        setError('Kunne ikke hente barn. Sjekk nettverk og prøv igjen.');
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [userRole, parentId]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadChildren(controller.signal);
    return () => controller.abort();
  }, [loadChildren]);

  return { children, loading, error, refetch: loadChildren };
}
