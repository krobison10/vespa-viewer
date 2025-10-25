import { useQuery } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function getConsole(dataSourceId, consoleId) {
  try {
    const response = await fetch(`${API_URL}/data-source/${dataSourceId}/console/${consoleId}`, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to fetch console: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result || null;
  } catch (error) {
    showError(error.message || 'Failed to fetch console');
    throw error;
  }
}

export function useConsoleQuery(dataSourceId, consoleId) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DATA_SOURCES, dataSourceId, 'console', consoleId],
    queryFn: () => getConsole(dataSourceId, consoleId),
    enabled: !!dataSourceId && !!consoleId,
    retry: false,
  });
}
