import { useMutation } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { API_URL } from '@/config';

async function login(body, handledCodes = []) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok && !handledCodes.includes(data.code)) {
      const errorMessage = `Failed to log in: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    showError(error.message || 'Failed to log in');
    throw error;
  }
}

export function useLoginMutation(handledCodes = []) {
  return useMutation({
    mutationFn: body => login(body, handledCodes),
  });
}
