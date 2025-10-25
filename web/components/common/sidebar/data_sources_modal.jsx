import { useState } from 'react';

import clsx from 'clsx';
import { Database, Loader2, Minus, Plus } from 'lucide-react';

import { ErrorBoundary } from '@/components/common/error_boundary';
import { useLoadingState } from '@/components/common/hooks/use_loading_state';
import { useCreateDataSourceMutation } from '@/components/common/sidebar/hooks/use_create_data_source_mutation';
import { useDataSourcesQuery } from '@/components/common/sidebar/hooks/use_data_sources_query';
import { useDeleteDataSourceMutation } from '@/components/common/sidebar/hooks/use_delete_data_source_mutation';
import { useUpdateDataSourceMutation } from '@/components/common/sidebar/hooks/use_update_data_source_mutation';
import { Text } from '@/components/common/text';
import { useConfirm } from '@/components/providers/confirm_provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DEFAULT_DATA_SOURCE = {
  name: 'New Data Source',
  search_url: 'http://localhost',
  document_url: 'http://localhost',
  config_url: 'http://localhost',
  search_port: '8080',
  document_port: '8080',
  config_port: '19071',
};

export function DataSourcesModal({ isOpen, closeModal }) {
  const { data: backendDataSources = [], isLoading } = useDataSourcesQuery();
  const { mutate: createDataSource } = useCreateDataSourceMutation();
  const { mutate: deleteDataSource } = useDeleteDataSourceMutation();
  const confirm = useConfirm();

  const [selectedDataSourceId, setSelectedDataSourceId] = useState(
    backendDataSources.length > 0 ? backendDataSources[0].id : null
  );

  const selectedDataSource = backendDataSources.find(ds => ds.id === selectedDataSourceId);

  const addDataSource = () => {
    // Find the highest existing data source number
    const existingNumbers = backendDataSources.map(ds => {
      const match = ds.name.match(/Data Source (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    createDataSource(
      {
        ...DEFAULT_DATA_SOURCE,
        name: `Data Source ${nextNumber}`,
      },
      {
        onSuccess: newDataSource => {
          setSelectedDataSourceId(newDataSource.id);
        },
      }
    );
  };

  const removeDataSource = async () => {
    if (!selectedDataSourceId) return;

    const confirmed = await confirm({
      title: 'Delete data source',
      description: `Are you sure you want to delete "${selectedDataSource?.name}"? This action cannot be undone.`,
      confirmationText: 'Delete',
      confirmationButtonProps: {
        variant: 'destructive',
      },
      dialogProps: {
        className: 'max-w-sm',
      },
    });

    if (!confirmed) return;

    deleteDataSource(selectedDataSourceId, {
      onSuccess: () => {
        setSelectedDataSourceId(null);
      },
    });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl overflow-hidden p-0 gap-0" aria-description="data-sources-content">
          <DialogTitle className="p-6 border-b text-2xl">Data Sources</DialogTitle>
          <ErrorBoundary>
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <Text>Loading...</Text>
              </div>
            ) : (
              <div className="h-[600px] flex flex-row gap-3">
                <div className="flex-shrink-0 p-3">
                  <DataSourcesSidebar
                    dataSources={backendDataSources}
                    selectedDataSourceId={selectedDataSourceId}
                    onSelectDataSource={setSelectedDataSourceId}
                    onAddDataSource={addDataSource}
                    onRemoveDataSource={removeDataSource}
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {selectedDataSource ? (
                    <ScrollArea className="h-full">
                      <div className="py-6 pr-6">
                        <DataSourceContent key={selectedDataSource.id} dataSource={selectedDataSource} />
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                      <div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full">
                        <Database className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <Text className="text-muted-foreground text-center">No data source selected</Text>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DataSourcesSidebar({
  dataSources,
  selectedDataSourceId,
  onSelectDataSource,
  onAddDataSource,
  onRemoveDataSource,
}) {
  return (
    <div className="h-full flex flex-col gap-2 w-56">
      <div className="flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onAddDataSource}>
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text variant="p">Add data source</Text>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRemoveDataSource} disabled={dataSources.length === 0}>
                <Minus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Text variant="p">Remove data source</Text>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 max-w-[212px]">
          {dataSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Database className="w-8 h-8 text-muted-foreground mb-3" />
              <Text className="text-sm text-muted-foreground mb-1 font-medium">No data sources</Text>
              <Text className="text-xs text-muted-foreground">Click the + button above to add one</Text>
            </div>
          ) : (
            dataSources.map(dataSource => (
              <div
                key={dataSource.id}
                className={clsx(
                  'flex items-center gap-2 cursor-pointer justify-start px-3 py-2 rounded-md text-sm overflow-hidden',
                  selectedDataSourceId === dataSource.id && 'bg-secondary'
                )}
                onClick={() => onSelectDataSource(dataSource.id)}
              >
                <Database className="w-4 h-4 flex-shrink-0" />
                <Text className="truncate min-w-0 flex-1">{dataSource.name}</Text>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function DataSourceContent({ dataSource }) {
  const { mutate: updateDataSource, isPending: isUpdating } = useUpdateDataSourceMutation();
  const [formData, setFormData] = useState({
    ...dataSource,
    name: dataSource.name || '',
    search_url: dataSource.search_url || '',
    search_port: dataSource.search_port || '',
    document_url: dataSource.document_url || '',
    document_port: dataSource.document_port || '',
    config_url: dataSource.config_url || '',
    config_port: dataSource.config_port || '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const showIsUpdating = useLoadingState(isUpdating, 300);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateDataSource(formData, {
      onSuccess: () => {
        setHasChanges(false);
      },
    });
  };

  if (!dataSource) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-px">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
          Data Source Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Enter data source name"
        />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col gap-2 col-span-4">
          <Label htmlFor="search_url" className="text-xs font-semibold text-muted-foreground">
            Search URL
          </Label>
          <Input
            id="search_url"
            value={formData.search_url}
            onChange={e => handleChange('search_url', e.target.value)}
            placeholder="http://localhost"
          />
        </div>
        <div className="flex flex-col gap-2 col-span-1">
          <Label htmlFor="search_port" className="text-xs font-semibold text-muted-foreground">
            Search Port
          </Label>
          <Input
            id="search_port"
            value={formData.search_port}
            onChange={e => handleChange('search_port', e.target.value)}
            placeholder="8080"
            type="number"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col gap-2 col-span-4">
          <Label htmlFor="document_url" className="text-xs font-semibold text-muted-foreground">
            Document URL
          </Label>
          <Input
            id="document_url"
            value={formData.document_url}
            onChange={e => handleChange('document_url', e.target.value)}
            placeholder="http://localhost"
          />
        </div>
        <div className="flex flex-col gap-2 col-span-1">
          <Label htmlFor="document_port" className="text-xs font-semibold text-muted-foreground">
            Document Port
          </Label>
          <Input
            id="document_port"
            value={formData.document_port}
            onChange={e => handleChange('document_port', e.target.value)}
            placeholder="8081"
            type="number"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col gap-2 col-span-4">
          <Label htmlFor="config_url" className="text-xs font-semibold text-muted-foreground">
            Config URL
          </Label>
          <Input
            id="config_url"
            value={formData.config_url}
            onChange={e => handleChange('config_url', e.target.value)}
            placeholder="http://localhost"
          />
        </div>
        <div className="flex flex-col gap-2 col-span-1">
          <Label htmlFor="config_port" className="text-xs font-semibold text-muted-foreground">
            Config Port
          </Label>
          <Input
            id="config_port"
            value={formData.config_port}
            onChange={e => handleChange('config_port', e.target.value)}
            placeholder="19071"
            type="number"
          />
        </div>
      </div>

      <div className="flex justify-start">
        <Button onClick={handleSave} disabled={isUpdating || !hasChanges} size="sm">
          {showIsUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}
