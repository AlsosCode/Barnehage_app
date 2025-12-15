import { useCallback } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  context: string;
  message: string;
  data?: unknown;
}

/**
 * Custom hook for logging throughout the app
 * @param context Component or module name
 * @returns Object with log functions
 */
export function useLogger(context: string) {
  const createEntry = useCallback(
    (level: LogEntry['level'], message: string, data?: unknown): LogEntry => {
      return {
        timestamp: new Date().toISOString(),
        level,
        context,
        message,
        data,
      };
    },
    [context]
  );

  const log = useCallback(
    (message: string, data?: unknown) => {
      const entry = createEntry('log', message, data);
      console.log(`[${entry.context}] ${entry.message}`, data ? entry.data : '');
    },
    [createEntry]
  );

  const error = useCallback(
    (message: string, data?: unknown) => {
      const entry = createEntry('error', message, data);
      console.error(`[${entry.context}] ❌ ${entry.message}`, data ? entry.data : '');
    },
    [createEntry]
  );

  const warn = useCallback(
    (message: string, data?: unknown) => {
      const entry = createEntry('warn', message, data);
      console.warn(`[${entry.context}] ⚠️ ${entry.message}`, data ? entry.data : '');
    },
    [createEntry]
  );

  const info = useCallback(
    (message: string, data?: unknown) => {
      const entry = createEntry('info', message, data);
      console.log(`[${entry.context}] ℹ️ ${entry.message}`, data ? entry.data : '');
    },
    [createEntry]
  );

  return { log, error, warn, info };
}
