import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

/**
 * Hook to fetch all consoles for a specific data source
 */
export function useDataSourceConsolesQuery(dataSourceId) {
  return useQuery({
    queryKey: QUERY_KEYS.CONSOLES_BY_DATA_SOURCE(dataSourceId),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/console/data-source/${dataSourceId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch consoles for data source');
      }

      const data = await response.json();
      return data.data.consoles || [];
    },
    enabled: !!dataSourceId,
  });
}
