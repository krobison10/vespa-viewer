import { useMutation, useQueryClient } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function updateUserSettings(body) {
  try {
    const response = await fetch(`${API_URL}/user/`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to update user settings: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    showError(error.message || 'Failed to update user settings');
    throw error;
  }
}

export function useUpdateUserSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: body => updateUserSettings(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER });
    },
  });
}
