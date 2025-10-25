import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function createConsole({ data_source_id, name, is_default = false }) {
  try {
    const response = await fetch(`${API_URL}/data-source/${data_source_id}/console`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, is_default }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to create console: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    showError(error.message || 'Failed to create console');
    throw error;
  }
}

export function useCreateConsoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => createConsole(params),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
