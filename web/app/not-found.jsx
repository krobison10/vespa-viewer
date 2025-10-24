'use client';

import { useRouter } from 'next/navigation';

import { Logo } from '@/components/common/logo';
import { Text } from '@/components/common/text';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col h-screen w-screen items-center justify-center gap-6">
      <div className="absolute top-4 left-4">
        <Logo />
      </div>
      <Text variant="h1">404</Text>
      <Text variant="h2">Page Not Found</Text>
      <Button onClick={() => router.push('/')}>Return home</Button>
    </div>
  );
}
