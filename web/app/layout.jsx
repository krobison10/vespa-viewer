import { Inter } from 'next/font/google';

import GlobalProviders from '@/components/providers/global_providers';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VespaViewer',
  description: 'We help you view Vespa and stuff',
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </head>
        <body className={inter.className}>
          <GlobalProviders>{children}</GlobalProviders>
        </body>
      </html>
    </>
  );
}
