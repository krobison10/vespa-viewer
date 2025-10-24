import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

/**
 * Hook to delete a console
 */
export function useDeleteConsoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data_source_id, console_id }) => {
      const response = await fetch(`${API_URL}/data-source/${data_source_id}/console/${console_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete console');
      }

      return console_id;
    },
    onSuccess: () => {
      // Invalidate data sources query to refresh the consoles
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
