import { useQuery } from '@tanstack/react-query';

import { showError } from '@/components/providers/alert_provider';
import { QUERY_KEYS } from '@/components/query_keys';
import { API_URL } from '@/config';

async function getUser() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    });

    const data = await response.json();

    return data;
  } catch (error) {
    showError(error.message || 'Failed to fetch user');
    throw error;
  }
}

export function useGetUserQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: () => getUser(),
    retry: false,
  });
}
