import { useQuery } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function getDataSources() {
  try {
    const response = await fetch(`${API_URL}/data-source`, {
      credentials: 'include',
    });

    const data = await response.json();

    return data?.items || [];
  } catch (error) {
    showError(error.message || 'Failed to fetch data sources');
    throw error;
  }
}

export function useDataSourcesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.DATA_SOURCES,
    queryFn: () => getDataSources(),
    retry: false,
  });
}
