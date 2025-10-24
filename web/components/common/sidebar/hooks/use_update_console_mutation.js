import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function updateConsole({ data_source_id, id, name, console_data }) {
  try {
    const body = {};
    if (name !== undefined) body.name = name;
    if (console_data !== undefined) body.console_data = console_data;

    const response = await fetch(`${API_URL}/data-source/${data_source_id}/console/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to update console: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    showError(error.message || 'Failed to update console');
    throw error;
  }
}

export function useUpdateConsoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => updateConsole(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DATA_SOURCES });
    },
  });
}
