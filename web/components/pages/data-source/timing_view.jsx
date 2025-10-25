import { Button } from '@/components/ui/button';

export function TimingView({ data, onAddParameter }) {
  if (!data) {
    return null;
  }

  const timing = data?.timing || data?.data?.timing || {};
  const root = data?.data?.root || data?.root;
  const coverage = root?.coverage || data?.data?.coverage || {};

  const timingEntries = [
    {
      label: 'Search Time (total time)',
      value: timing.searchtime !== undefined ? timing.searchtime * 1000 : undefined,
      unit: 'ms',
    },
    { label: 'Query Time', value: timing.querytime !== undefined ? timing.querytime * 1000 : undefined, unit: 'ms' },
    {
      label: 'Summary Fetch Time',
      value: timing.summaryfetchtime !== undefined ? timing.summaryfetchtime * 1000 : undefined,
      unit: 'ms',
    },
  ];

  const statsEntries = [
    { label: 'Total Hit Count', value: root?.fields?.totalCount },
    { label: 'Coverage', value: coverage?.coverage !== undefined ? `${coverage.coverage}%` : undefined },
    { label: 'Total Documents', value: coverage?.documents },
    { label: 'Full Coverage', value: coverage?.full ? 'Yes' : 'No' },
    { label: 'Nodes', value: coverage?.nodes },
    { label: 'Results', value: coverage?.results },
  ];

  return (
    <div className="p-4 space-y-6 pb-8">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Timing Information</h3>
        <div className="space-y-2">
          {timingEntries.map(({ label, value, unit }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-mono font-medium">{value !== undefined ? `${value} ${unit}` : 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Coverage</h3>
        <div className="space-y-2">
          {statsEntries.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-mono font-medium">
                {value !== undefined && value !== null ? String(value) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted/30 rounded-md border border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Missing timing data? Add{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">presentation.timing=true</code> to the request
        </p>
        <Button size="sm" variant="outline" onClick={() => onAddParameter?.('presentation.timing', 'true')}>
          Add Timing Parameter
        </Button>
      </div>
    </div>
  );
}
