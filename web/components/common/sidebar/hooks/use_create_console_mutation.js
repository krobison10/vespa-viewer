import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

/**
 * Hook to create a new console
 */
export function useCreateConsoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data_source_id, name, is_default = false }) => {
      const response = await fetch(`${API_URL}/data-source/${data_source_id}/console`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, is_default }),
      });

      if (!response.ok) {
        throw new Error('Failed to create console');
      }

      const data = await response.json();
      return data.data.console;
    },
    onSuccess: () => {
      // Invalidate data sources query to refresh the consoles
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
