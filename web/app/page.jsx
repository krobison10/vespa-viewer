import React from 'react';

import ExternalLayout from '@/components/layouts/external_layout';
import InternalLayout from '@/components/layouts/internal_layout';
import { Login } from '@/components/pages/auth/login';
import InternalProviders from '@/components/providers/internal_providers';
import { getAuth } from '@/utils/server';

export default async function Root() {
  const { isLoggedIn } = await getAuth();

  if (isLoggedIn) {
    return (
      <InternalProviders>
        <InternalLayout>
          <></>
        </InternalLayout>
      </InternalProviders>
    );
  }

  return <Login />;
}
