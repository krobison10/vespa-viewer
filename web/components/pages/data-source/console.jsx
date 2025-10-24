'use client';

import { useParams } from 'next/navigation';

export function Console() {
  const params = useParams();
  const { dataSourceId, consoleId } = params;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Console content will go here */}
      <p className="text-muted-foreground">Console interface coming soon...</p>
    </div>
  );
}
