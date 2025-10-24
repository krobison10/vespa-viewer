'use client';

import { useRouter } from 'next/navigation';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  return (
    <html>
      <body className="h-screen w-full flex flex-col items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground">{error?.message || 'An unexpected error occurred'}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Go to dashboard
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
