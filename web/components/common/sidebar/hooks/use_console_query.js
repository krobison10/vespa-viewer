import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

/**
 * Hook to fetch a single console by id
 */
export function useConsoleQuery(consoleId) {
  return useQuery({
    queryKey: QUERY_KEYS.CONSOLE(consoleId),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/console/${consoleId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch console');
      }

      const data = await response.json();
      return data.data.console;
    },
    enabled: !!consoleId,
  });
}
