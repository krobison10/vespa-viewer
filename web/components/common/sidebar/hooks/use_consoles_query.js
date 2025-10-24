import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

/**
 * Hook to fetch all consoles for the authenticated user
 */
export function useConsolesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.CONSOLES,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/console`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch consoles');
      }

      const data = await response.json();
      return data.data.consoles || [];
    },
  });
}
