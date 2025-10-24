import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

/**
 * Hook to update a console
 */
export function useUpdateConsoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data_source_id, id, name }) => {
      const response = await fetch(`${API_URL}/data-source/${data_source_id}/console/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update console');
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
