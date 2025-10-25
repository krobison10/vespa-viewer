import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function updateDataSource({ id, ...body }) {
  try {
    const response = await fetch(`${API_URL}/data-source/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to update data source: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    showError(error.message || 'Failed to update data source');
    throw error;
  }
}

export function useUpdateDataSourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: body => updateDataSource(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
