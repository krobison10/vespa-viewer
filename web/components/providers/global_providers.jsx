'use client';

import { Suspense } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PropTypes from 'prop-types';

import { AlertProvider } from '@/components/providers/alert_provider';
import { ConfirmProvider } from '@/components/providers/confirm_provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function GlobalProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AlertProvider>
          <ConfirmProvider>
            <Suspense fallback={<div></div>}>{children}</Suspense>
          </ConfirmProvider>
        </AlertProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

GlobalProviders.propTypes = {
  children: PropTypes.node.isRequired,
};
