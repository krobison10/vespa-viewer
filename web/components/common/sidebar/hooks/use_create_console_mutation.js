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
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create console');
      }

      const data = await response.json();
      return data.result;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
    onError: error => {
      console.error('Failed to create console:', error);
    },
  });
}
