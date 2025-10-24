import { useId, useState } from 'react';

import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight, DatabaseZap, Plus } from 'lucide-react';

import { useLoadingState } from '@/components/common/hooks/use_loading_state';
import { useModalState } from '@/components/common/hooks/use_modal_state';
import { DataSourcesModal } from '@/components/common/sidebar/data_sources_modal';
import { useCreateConsoleMutation } from '@/components/common/sidebar/hooks/use_create_console_mutation';
import { useDataSourcesQuery } from '@/components/common/sidebar/hooks/use_data_sources_query';
import { Text } from '@/components/common/text';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const scrollAreaId = useId();
  const { data: dataSources = [], isLoading } = useDataSourcesQuery();

  const showLoading = useLoadingState(isLoading);

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

function DataSourceItem({ dataSource }) {
  const { mutate: createConsole } = useCreateConsoleMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const consoles = (dataSource.consoles || []).filter(c => c.id !== null);
  const nonDefaultConsoles = consoles.filter(c => !c.is_default);
  const defaultConsole = consoles.find(c => c.is_default);
  const hasMultipleConsoles = nonDefaultConsoles.length > 0;

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
    setMenuOpen(false);
  };

  const handleContextMenu = e => {
    e.preventDefault();
    setMenuOpen(true);
  };

  // If only has default console, show as non-expandable (clicking opens default console)
  if (!hasMultipleConsoles) {
    return (
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <div
          onContextMenu={handleContextMenu}
          className="hover:bg-accent rounded-md px-2 py-1.5 cursor-pointer"
          onClick={() => {
            // TODO: Open default console
            console.log('Open default console:', defaultConsole);
          }}
        >
          <Text className="text-sm truncate">{dataSource.name}</Text>
        </div>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleCreateConsole}>
            <Plus className="w-4 h-4 mr-2" />
            New Console
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Has multiple consoles, show as collapsible
  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <div onContextMenu={handleContextMenu}>
          <Collapsible.Trigger className="flex items-center gap-2 w-full text-left hover:bg-accent rounded-md px-2 py-1.5">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <Text className="text-sm truncate">{dataSource.name}</Text>
          </Collapsible.Trigger>
        </div>

        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleCreateConsole}>
            <Plus className="w-4 h-4 mr-2" />
            New Console
          </DropdownMenuItem>
        </DropdownMenuContent>

        <Collapsible.Content>
          <div className="ml-6 flex flex-col gap-0.5 mt-0.5">
            {defaultConsole && (
              <div
                className="px-2 py-1 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => {
                  // TODO: Open console
                  console.log('Open console:', defaultConsole);
                }}
              >
                <Text className="text-sm text-muted-foreground">{defaultConsole.name}</Text>
              </div>
            )}
            {nonDefaultConsoles.map(console => (
              <div
                key={console.id}
                className="px-2 py-1 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => {
                  // TODO: Open console
                  console.log('Open console:', console);
                }}
              >
                <Text className="text-sm text-muted-foreground">{console.name}</Text>
              </div>
            ))}
          </div>
        </Collapsible.Content>
      </DropdownMenu>
    </Collapsible.Root>
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
