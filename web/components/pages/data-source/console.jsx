'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useParams } from 'next/navigation';

import { Check, GripHorizontal, Loader2, Play, Plus, Trash2 } from 'lucide-react';

import { useConsoleQuery } from '@/components/common/sidebar/hooks/use_console_query';
import { useDataSourceQuery } from '@/components/common/sidebar/hooks/use_data_source_query';
import { useUpdateConsoleMutation } from '@/components/common/sidebar/hooks/use_update_console_mutation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

const MIN_SECTION_HEIGHT = 150;
const AUTO_SAVE_INTERVAL = 1000; // Check for changes every 1 second

function SavingStatus({ isPending, hasUnsavedChanges }) {
  if (isPending) {
    return (
      <div className="flex items-center gap-1 text-sm text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-1 text-sm text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm text-green-600">
      <Check className="h-3 w-3" />
      <span>Saved</span>
    </div>
  );
}

export function Console() {
  const params = useParams();
  const { dataSourceId, consoleId } = params;

  const { data: dataSource } = useDataSourceQuery(dataSourceId);
  const { data: consoleData } = useConsoleQuery(dataSourceId, consoleId);
  const updateConsoleMutation = useUpdateConsoleMutation();

  const [yqlQuery, setYqlQuery] = useState('');
  const [parameters, setParameters] = useState([{ id: Date.now(), key: '', value: '' }]);
  const [results, setResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [queryHeight, setQueryHeight] = useState(33.33);
  const [parametersHeight, setParametersHeight] = useState(33.33);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const containerRef = useRef(null);
  const isDragging = useRef(null);
  const saveIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastSavedStateRef = useRef(null);

  const addParameter = () => {
    setParameters([...parameters, { id: Date.now(), key: '', value: '' }]);
  };

  const removeParameter = id => {
    setParameters(parameters.filter(p => p.id !== id));
  };

  const updateParameter = (id, field, value) => {
    setParameters(parameters.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleYqlKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = yqlQuery.substring(0, start) + '    ' + yqlQuery.substring(end);
      setYqlQuery(newValue);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const executeQuery = async () => {
    setIsExecuting(true);
    // TODO: Implement actual query execution
    setTimeout(() => {
      setResults({ message: 'Query execution will be implemented' });
      setIsExecuting(false);
    }, 1000);
  };

  const handleMouseDown = section => {
    isDragging.current = section;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = e => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const relativeY = e.clientY - containerRect.top;
    const percentage = (relativeY / containerHeight) * 100;

    if (isDragging.current === 'query') {
      // Dragging between query and parameters
      const minPercent = (MIN_SECTION_HEIGHT / containerHeight) * 100;
      const maxPercent = 100 - ((MIN_SECTION_HEIGHT * 2) / containerHeight) * 100;

      const newQueryHeight = Math.max(minPercent, Math.min(maxPercent, percentage));
      setQueryHeight(newQueryHeight);
    } else if (isDragging.current === 'parameters') {
      // Dragging between parameters and results
      const minPercent = (MIN_SECTION_HEIGHT / containerHeight) * 100;
      const maxPercent = 100 - (MIN_SECTION_HEIGHT / containerHeight) * 100;

      const newParametersHeight = Math.max(minPercent, Math.min(maxPercent, percentage - queryHeight));
      setParametersHeight(newParametersHeight);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Load initial console data
  useEffect(() => {
    if (consoleData && !isInitializedRef.current) {
      const data = consoleData.console_data;
      if (data?.yql) setYqlQuery(data.yql);
      if (data?.parameters) setParameters(data.parameters);
      if (data?.panelSizes) {
        setQueryHeight(data.panelSizes.queryHeight);
        setParametersHeight(data.panelSizes.parametersHeight);
      }

      // Set initial saved state
      lastSavedStateRef.current = {
        yql: data?.yql || '',
        parameters: data?.parameters || [{ id: Date.now(), key: '', value: '' }],
        panelSizes: data?.panelSizes || { queryHeight: 33.33, parametersHeight: 33.33 },
      };

      isInitializedRef.current = true;
    }
  }, [consoleData]);

  // Check if current state differs from saved state
  const hasChanges = useCallback(() => {
    if (!lastSavedStateRef.current) return false;

    const currentState = {
      yql: yqlQuery,
      parameters: parameters,
      panelSizes: { queryHeight, parametersHeight },
    };

    return JSON.stringify(currentState) !== JSON.stringify(lastSavedStateRef.current);
  }, [yqlQuery, parameters, queryHeight, parametersHeight]);

  // Auto-save console state
  const saveConsoleState = useCallback(() => {
    if (!isInitializedRef.current) return;

    const console_data = {
      yql: yqlQuery,
      parameters: parameters,
      panelSizes: {
        queryHeight,
        parametersHeight,
      },
    };

    lastSavedStateRef.current = console_data;
    setHasUnsavedChanges(false);
    updateConsoleMutation.mutate({
      data_source_id: dataSourceId,
      id: consoleId,
      console_data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yqlQuery, parameters, queryHeight, parametersHeight, dataSourceId, consoleId]);

  // Update unsaved changes indicator when state changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    setHasUnsavedChanges(hasChanges());
  }, [yqlQuery, parameters, queryHeight, parametersHeight, hasChanges]);

  // Interval-based auto-save: check for changes every 5 seconds
  useEffect(() => {
    if (!isInitializedRef.current) return;

    saveIntervalRef.current = setInterval(() => {
      if (hasChanges()) {
        saveConsoleState();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [hasChanges, saveConsoleState]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [queryHeight, parametersHeight]);

  const resultsHeight = 100 - queryHeight - parametersHeight;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-muted-foreground">{dataSource?.name || 'Data Source'}</span>
          <span className="text-muted-foreground">/</span>
          <span>{consoleData?.name || 'Console'}</span>
        </div>
        <SavingStatus isPending={updateConsoleMutation.isPending} hasUnsavedChanges={hasUnsavedChanges} />
      </div>

      {/* Query Editor Section */}
      <div className="flex flex-col border-b" style={{ height: `${queryHeight}%` }}>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <h3 className="text-sm font-medium">YQL Query</h3>
          <Button size="sm" onClick={executeQuery} disabled={isExecuting} className="gap-2">
            <Play className="h-4 w-4" />
            Execute
          </Button>
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            value={yqlQuery}
            onChange={e => setYqlQuery(e.target.value)}
            onKeyDown={handleYqlKeyDown}
            placeholder="Enter your Vespa YQL query here..."
            className="h-full resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="h-1 bg-border hover:bg-primary/50 cursor-ns-resize flex items-center justify-center transition-colors"
        onMouseDown={() => handleMouseDown('query')}
      >
        <GripHorizontal className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* Parameters Section */}
      <div className="flex flex-col border-b" style={{ height: `${parametersHeight}%` }}>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <h3 className="text-sm font-medium">Parameters</h3>
          <Button size="sm" variant="outline" onClick={addParameter} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Parameter
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {parameters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No parameters. Click "Add Parameter" to add one.
              </p>
            ) : (
              parameters.map(param => (
                <div key={param.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Key"
                    value={param.key}
                    onChange={e => updateParameter(param.id, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={param.value}
                    onChange={e => updateParameter(param.id, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeParameter(param.id)} className="shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Resize Handle */}
      <div
        className="h-1 bg-border hover:bg-primary/50 cursor-ns-resize flex items-center justify-center transition-colors"
        onMouseDown={() => handleMouseDown('parameters')}
      >
        <GripHorizontal className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* Results Section */}
      <div className="flex flex-col" style={{ height: `${resultsHeight}%` }}>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <h3 className="text-sm font-medium">Results</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            {results ? (
              <pre className="text-sm font-mono bg-muted/50 p-4 rounded-md overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Execute a query to see results here</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
