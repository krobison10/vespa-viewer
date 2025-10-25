import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function deleteDataSource(id) {
  try {
    const response = await fetch(`${API_URL}/data-source/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to delete data source: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    showError(error.message || 'Failed to delete data source');
    throw error;
  }
}

export function useDeleteDataSourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => deleteDataSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
