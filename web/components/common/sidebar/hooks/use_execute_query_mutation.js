import { useMutation } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { API_URL } from '@/config';

async function executeQuery({ data_source_id, id, yql, parameters, console_data }) {
  try {
    const response = await fetch(`${API_URL}/data-source/${data_source_id}/console/${id}/execute`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ yql, parameters, console_data }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to execute query: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    showError(error.message || 'Failed to execute query');
    throw error;
  }
}

export function useExecuteQueryMutation() {
  return useMutation({
    mutationFn: params => executeQuery(params),
  });
}
