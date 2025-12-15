import { useState, useCallback } from 'react';
import api from '@/services/api';
import { ChildStatus } from '@/constants/statuses';
import { useLogger } from './useLogger';

export interface ChildData {
  id: string;
  name: string;
  group?: string;
  status: ChildStatus;
  checkedInTime?: string;
  checkedOutTime?: string;
}

/**
 * Custom hook for managing child status.
 * If childId is provided, status changes are synced to the backend.
 */
export function useStatus(childId?: number) {
  const { log, error } = useLogger('useStatus');
  const [status, setStatus] = useState<ChildStatus>(ChildStatus.CHECKED_OUT);
  const [loading, setLoading] = useState(false);

  const updateStatus = useCallback(
    async (newStatus: ChildStatus) => {
      const prev = status;
      try {
        setLoading(true);
        setStatus(newStatus);
        log(`Updating status to ${newStatus}${childId ? ` (id ${childId})` : ''}`);

        if (childId) {
          if (newStatus === ChildStatus.CHECKED_IN) {
            await api.children.checkIn(childId);
          } else if (newStatus === ChildStatus.CHECKED_OUT) {
            await api.children.checkOut(childId);
          } else {
            await api.children.update(childId, { status: newStatus });
          }
        }
        return true;
      } catch (err) {
        error('Failed to update status', { error: err });
        setStatus(prev);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [childId, error, log, status]
  );

  const checkIn = useCallback(async () => {
    return updateStatus(ChildStatus.CHECKED_IN);
  }, [updateStatus]);

  const checkOut = useCallback(async () => {
    return updateStatus(ChildStatus.CHECKED_OUT);
  }, [updateStatus]);

  const markHome = useCallback(async () => {
    return updateStatus(ChildStatus.HOME);
  }, [updateStatus]);

  return {
    status,
    loading,
    updateStatus,
    checkIn,
    checkOut,
    markHome,
  };
}
