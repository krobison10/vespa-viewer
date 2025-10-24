import { useId } from 'react';

import { useRouter } from 'next/navigation';

import { DatabaseZap } from 'lucide-react';

import { useModalState } from '@/components/common/hooks/use_modal_state';
import { DataSourcesModal } from '@/components/common/sidebar/data_sources_modal';
import { Text } from '@/components/common/text';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const router = useRouter();
  const scrollAreaId = useId();

  return (
    <div className="w-64 px-1 flex flex-col h-full">
      <div className="flex gap-2 px-1">
        <DataSourcesButton />
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

function DataSourcesButton() {
  const {
    isOpen: isDataSourcesModalOpen,
    openModal: openDataSourcesModal,
    closeModal: closeDataSourcesModal,
  } = useModalState(false);

  return (
    <div>
      {isDataSourcesModalOpen && (
        <DataSourcesModal isOpen={isDataSourcesModalOpen} closeModal={closeDataSourcesModal} />
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="" size="icon" onClick={openDataSourcesModal}>
              <DatabaseZap className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <Text variant="p">Data sources</Text>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
