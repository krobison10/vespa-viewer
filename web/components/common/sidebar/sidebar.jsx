import { useEffect, useId, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRight, DatabaseZap, Plus, Unplug } from 'lucide-react';

import { useLoadingState } from '@/components/common/hooks/use_loading_state';
import { useModalState } from '@/components/common/hooks/use_modal_state';
import { ConsoleItem } from '@/components/common/sidebar/console_item';
import { DataSourcesModal } from '@/components/common/sidebar/data_sources_modal';
import { useCreateConsoleMutation } from '@/components/common/sidebar/hooks/use_create_console_mutation';
import { useDataSourcesQuery } from '@/components/common/sidebar/hooks/use_data_sources_query';
import { Text } from '@/components/common/text';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const scrollAreaId = useId();
  const { data: dataSources = [], isLoading } = useDataSourcesQuery();

  const showLoading = useLoadingState(isLoading);

  return (
    <div className="w-[256px] flex flex-col h-full">
      <div className="flex gap-2 px-1">
        <DataSourcesButton />
      </div>

      <ScrollArea
        className="h-full flex-1 mb-4 px-1"
        viewportProps={{
          id: `scroll-${scrollAreaId}`,
          className: '!overflow-y-auto',
        }}
      >
        <div className="flex flex-col gap-1 mt-4 px-2">
          {showLoading ? (
            <>
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
            </>
          ) : (
            dataSources.map(dataSource => <DataSourceItem key={dataSource.id} dataSource={dataSource} />)
          )}
        </div>
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

function DataSourceItem({ dataSource }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: createConsole } = useCreateConsoleMutation();
  const [isOpen, setIsOpen] = useState(false);

  const consoles = (dataSource.consoles || []).filter(c => c.id !== null);
  const nonDefaultConsoles = consoles.filter(c => !c.is_default);
  const defaultConsole = consoles.find(c => c.is_default);
  const hasMultipleConsoles = nonDefaultConsoles.length > 0;

  // Parse current URL to determine active data source and console
  const pathMatch = pathname?.match(/\/data-source\/(\d+)\/console\/(.+)/);
  const activeDataSourceId = pathMatch ? parseInt(pathMatch[1], 10) : null;
  const activeConsoleId = pathMatch ? pathMatch[2] : null;

  const isActiveDataSource = activeDataSourceId === dataSource.id;
  const isActiveDefaultConsole = isActiveDataSource && activeConsoleId === 'default';

  // Auto-expand if this data source is active and has multiple consoles
  useEffect(() => {
    if (isActiveDataSource && hasMultipleConsoles) {
      setIsOpen(true);
    }
  }, [isActiveDataSource, hasMultipleConsoles]);

  const handleCreateConsole = () => {
    const existingNumbers = consoles
      .filter(c => !c.is_default)
      .map(c => {
        const match = c.name.match(/Console (\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    createConsole({
      data_source_id: dataSource.id,
      name: `Console ${nextNumber}`,
      is_default: false,
    });
  };

  const navigateToConsole = (consoleId, isDefault = false) => {
    const id = isDefault ? 'default' : consoleId;
    router.push(`/data-source/${dataSource.id}/console/${id}`);
  };

  const navigateToDefaultConsole = () => {
    navigateToConsole(null, true);
  };

  // If only has default console, show as non-expandable (clicking opens default console)
  if (!hasMultipleConsoles) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`flex items-center gap-1 hover:bg-accent rounded-md px-2 py-1.5 cursor-pointer ${
              isActiveDataSource ? 'bg-accent' : ''
            }`}
            onClick={navigateToDefaultConsole}
          >
            <Unplug className="w-4 h-4 flex-shrink-0" />
            <Text className="text-sm truncate">{dataSource.name}</Text>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleCreateConsole}>
            <Plus className="w-4 h-4 mr-2" />
            New Console
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Has multiple consoles, show as collapsible
  return (
    <ContextMenu>
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <ContextMenuTrigger asChild>
          <Collapsible.Trigger className="flex items-center gap-1 text-left hover:bg-accent rounded-md px-1 py-1.5 max-w-[232px] overflow-hidden">
            <ChevronRight
              className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            />
            <Unplug className="w-4 h-4 flex-shrink-0" />
            <Text className="text-sm truncate min-w-0 flex-1">{dataSource.name}</Text>
          </Collapsible.Trigger>
        </ContextMenuTrigger>

        <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="ml-2 pl-1 border-l-2 border-border flex flex-col gap-0.5 mt-0.5 max-w-[224px]">
            {defaultConsole && (
              <ConsoleItem
                console={defaultConsole}
                dataSourceId={dataSource.id}
                isSelected={isActiveDefaultConsole}
                onClick={() => navigateToConsole(defaultConsole.id, true)}
                showOptionsMenu={false}
              />
            )}
            {nonDefaultConsoles.map(console => {
              const isActiveConsole = isActiveDataSource && activeConsoleId === console.id.toString();
              return (
                <ConsoleItem
                  key={console.id}
                  console={console}
                  dataSourceId={dataSource.id}
                  isSelected={isActiveConsole}
                  onClick={() => navigateToConsole(console.id)}
                />
              );
            })}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleCreateConsole}>
          <Plus className="w-4 h-4 mr-2" />
          New Console
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
