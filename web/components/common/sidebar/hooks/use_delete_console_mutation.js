import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function deleteConsole({ data_source_id, id }) {
  try {
    const response = await fetch(`${API_URL}/data-source/${data_source_id}/console/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to delete console: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    showError(error.message || 'Failed to delete console');
    throw error;
  }
}

export function useDeleteConsoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => deleteConsole(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
