'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useParams } from 'next/navigation';

import 'highlight.js/styles/github-dark.css';
import { Check, GripHorizontal, Loader2, Play, Plus, Terminal, Trash2, Unplug } from 'lucide-react';

import { useConsoleQuery } from '@/components/common/sidebar/hooks/use_console_query';
import { useDataSourceQuery } from '@/components/common/sidebar/hooks/use_data_source_query';
import { useExecuteQueryMutation } from '@/components/common/sidebar/hooks/use_execute_query_mutation';
import { useUpdateConsoleMutation } from '@/components/common/sidebar/hooks/use_update_console_mutation';
import { STATUS_VARIANT, StatusBadge } from '@/components/common/status_badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { FormattedView } from './formatted_view';
import { RawView } from './raw_view';
import { TimingView } from './timing_view';

const MIN_SECTION_HEIGHT = 150;
const AUTO_SAVE_INTERVAL = 1000; // Check for changes every 1 second

function getStatusVariant(statusCode) {
  if (!statusCode) return STATUS_VARIANT.NEUTRAL;
  if (statusCode >= 200 && statusCode < 300) return STATUS_VARIANT.POSITIVE;
  if (statusCode >= 300 && statusCode < 400) return STATUS_VARIANT.NEUTRAL;
  if (statusCode >= 400 && statusCode < 500) return STATUS_VARIANT.WARN;
  if (statusCode >= 500) return STATUS_VARIANT.DESTRUCTIVE;
  return STATUS_VARIANT.NEUTRAL;
}

function getStatusText(statusCode, statusText) {
  if (statusText) return statusText;
  if (statusCode === 200) return 'Success';
  if (statusCode === 201) return 'Created';
  return '';
}

function SavingStatus({ isPending, hasUnsavedChanges }) {
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
  const { data: consoleData, error: consoleError } = useConsoleQuery(dataSourceId, consoleId);
  const updateConsoleMutation = useUpdateConsoleMutation();
  const executeQueryMutation = useExecuteQueryMutation();

  const [yqlQuery, setYqlQuery] = useState('');
  const [parameters, setParameters] = useState([{ id: Date.now(), key: '', value: '' }]);
  const [results, setResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeResultsTab, setActiveResultsTab] = useState('raw');

  const [queryHeight, setQueryHeight] = useState(33.33);
  const [parametersHeight, setParametersHeight] = useState(33.33);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const containerRef = useRef(null);
  const isDragging = useRef(null);
  const saveIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);
  const lastSavedStateRef = useRef(null);
  const fullConsoleDataRef = useRef(null);

  const addParameter = () => {
    setParameters([...parameters, { id: Date.now(), key: '', value: '' }]);
  };

  const addParameterWithValue = (key, value) => {
    // Check if parameter already exists and update it, otherwise add new
    const existingParam = parameters.find(p => p.key === key);
    if (existingParam) {
      setParameters(parameters.map(p => (p.key === key ? { ...p, value } : p)));
    } else {
      setParameters([...parameters, { id: Date.now(), key, value }]);
    }
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
    if (!yqlQuery.trim()) {
      return;
    }

    setIsExecuting(true);

    try {
      // Merge with existing console_data to preserve fields like lastResponse
      const console_data = {
        ...fullConsoleDataRef.current,
        yql: yqlQuery,
        parameters: parameters,
        panelSizes: {
          queryHeight,
          parametersHeight,
        },
      };

      const result = await executeQueryMutation.mutateAsync({
        data_source_id: dataSourceId,
        id: consoleId,
        yql: yqlQuery,
        parameters: parameters,
        console_data,
      });

      setResults(result);

      // Update fullConsoleDataRef with the new lastResponse
      if (result?.data) {
        fullConsoleDataRef.current = {
          ...console_data,
          lastResponse: result.data,
        };
      }
    } catch (error) {
      // API errors are shown via alert, don't set results
    } finally {
      setIsExecuting(false);
    }
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
      const data = consoleData.console_data || {};
      if (data?.yql) setYqlQuery(data.yql);
      if (data?.parameters) setParameters(data.parameters);
      if (data?.panelSizes) {
        setQueryHeight(data.panelSizes.queryHeight);
        setParametersHeight(data.panelSizes.parametersHeight);
      }
      if (data?.lastResponse) {
        setResults({ success: true, status: 200, data: data.lastResponse });
      }

      // Store the full console_data to preserve fields we don't manage
      fullConsoleDataRef.current = data;

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

    // Merge with existing console_data to preserve fields like lastResponse
    const console_data = {
      ...fullConsoleDataRef.current,
      yql: yqlQuery,
      parameters: parameters,
      panelSizes: {
        queryHeight,
        parametersHeight,
      },
    };

    fullConsoleDataRef.current = console_data;
    lastSavedStateRef.current = {
      yql: yqlQuery,
      parameters: parameters,
      panelSizes: { queryHeight, parametersHeight },
    };
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

  // Show 404 page if console not found
  if (consoleError?.status === 404) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <Terminal className="w-16 h-16" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Console Not Found</h2>
          <p className="text-sm">This console may have been deleted or does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex items-center gap-1">
            <Unplug className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{dataSource?.name || 'Data Source'}</span>
          </div>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-1">
            <Terminal className="w-4 h-4 flex-shrink-0" />
            <span className="">{consoleData?.name || 'Console'}</span>
          </div>
        </div>
        <SavingStatus isPending={updateConsoleMutation.isPending} hasUnsavedChanges={hasUnsavedChanges} />
      </div>

      {/* Query Editor Section */}
      <div className="flex flex-col border-b" style={{ height: `${queryHeight}%` }}>
        {/* YQL Query Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 h-[50px]">
          <h3 className="text-md font-semibold">YQL Query</h3>
          <Button size="sm" onClick={executeQuery} disabled={isExecuting} className="gap-2">
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Execute
          </Button>
        </div>

        {/* YQL Query Editor */}
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
        {/* Parameters Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 h-[50px]">
          <h3 className="text-md font-semibold">Parameters</h3>
        </div>

        {/* Parameters Editor */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2 max-w-[900px]">
            {parameters.map(param => (
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
            ))}
            <Button size="sm" variant="outline" onClick={addParameter} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Parameter
            </Button>
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
        <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab} className="flex flex-col h-full">
          {/* Results Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 h-[50px]">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-semibold">Results</h3>
              {results?.status && (
                <StatusBadge
                  variant={getStatusVariant(results.status)}
                  text={`${results.status} - ${getStatusText(results.status, results.statusText)}`}
                />
              )}
            </div>
            <TabsList>
              <TabsTrigger value="raw" className="!text-xs">
                JSON
              </TabsTrigger>
              <TabsTrigger value="formatted" className="!text-xs">
                Formatted
              </TabsTrigger>
              <TabsTrigger value="timing" className="!text-xs">
                Performance
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Results Content */}
          <div className="flex-1 overflow-auto relative">
            <TabsContent value="raw" className="m-0 h-full">
              <RawView data={results} />
            </TabsContent>
            <TabsContent value="formatted" className="m-0 h-full">
              <FormattedView data={results} />
            </TabsContent>
            <TabsContent value="timing" className="m-0 h-full">
              <TimingView data={results} onAddParameter={addParameterWithValue} />
            </TabsContent>

            {/* Executing overlay */}
            {isExecuting && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Executing query...</span>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
