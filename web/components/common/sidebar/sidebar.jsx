import { useId } from 'react';

import { useRouter } from 'next/navigation';

import { Server } from 'lucide-react';

import { Text } from '@/components/common/text';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const router = useRouter();

  const scrollAreaId = useId();

  return (
    <div className="w-64 px-1 flex flex-col h-full">
      <div className="px-3 pb-3 mb-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between min-h-fit p-2 group"
                onClick={() => router.push('/connections')}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-[1px] border-border bg-background group-hover:bg-background/50">
                    <Server />
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <Text variant="p" className="">
                      Connections
                    </Text>
                    <Text variant="p" className="text-xs text-muted-foreground">
                      Create and manage
                    </Text>
                  </div>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text variant="p">Create and manage your connections</Text>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea
        className="h-full flex-1 mb-4"
        viewportProps={{
          id: `scroll-${scrollAreaId}`,
          className: '!overflow-y-auto',
        }}
      >
        <div className="flex flex-col gap-6"></div>
      </ScrollArea>
    </div>
  );
}
