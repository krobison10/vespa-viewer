import { useMutation } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { API_URL } from '@/config';

async function logOut() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = `Failed to log out: ${data?.message || 'unknown error'}`;
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    showError(error.message || 'Failed to log out');
    throw error;
  }
}

export function useLogOutMutation() {
  return useMutation({
    mutationFn: logOut,
  });
}
