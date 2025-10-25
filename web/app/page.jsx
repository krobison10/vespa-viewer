import React from 'react';

import { Terminal } from 'lucide-react';

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
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Terminal className="w-16 h-16" />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Welcome to VespaViewer</h2>
              <p className="text-sm">Create or select a data source and console to continue</p>
            </div>
          </div>
        </InternalLayout>
      </InternalProviders>
    );
  }

  return <Login />;
}
