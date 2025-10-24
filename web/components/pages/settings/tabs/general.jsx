import { useContext } from 'react';

import UserContext from '@/components/providers/user_provider';

export function General() {
  const { user } = useContext(UserContext);

  return <div className="pl-3"></div>;
}
