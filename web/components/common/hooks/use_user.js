import { useContext } from 'react';

import UserContext from '@/components/providers/user_provider';

export function useUser() {
  const { user } = useContext(UserContext);

  return user;
}
