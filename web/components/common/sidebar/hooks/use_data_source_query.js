import { useQuery } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function getDataSource(id) {
  try {
    const response = await fetch(`${API_URL}/data-source/${id}`, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to fetch data source: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.dataSource || null;
  } catch (error) {
    showError(error.message || 'Failed to fetch data source');
    throw error;
  }
}

export function useDataSourceQuery(id) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DATA_SOURCES, id],
    queryFn: () => getDataSource(id),
    enabled: !!id,
    retry: false,
  });
}
