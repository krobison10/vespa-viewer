import { redirect } from 'next/navigation';

import { UserProvider } from '@/components/providers/user_provider';
import { getAuth } from '@/utils/server';

export default async function InternalProviders({ children }) {
  const { isLoggedIn } = await getAuth();

  if (!isLoggedIn) {
    redirect('/login');
  }

  return <UserProvider>{children}</UserProvider>;
}
