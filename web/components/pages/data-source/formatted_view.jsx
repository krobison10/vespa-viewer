import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function FormattedView({ data }) {
  if (!data) {
    return null;
  }

  // Extract hits from Vespa response
  const hits = data?.data?.root?.children || [];

  // Flatten nested objects into dot notation
  const flattenObject = (obj, prefix = '') => {
    const flattened = {};
    for (const [key, value] of Object.entries(obj || {})) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, fullKey));
      } else {
        flattened[fullKey] = value;
      }
    }
    return flattened;
  };

  // Get all unique columns from all rows (including non-field properties)
  const allColumns = new Set();
  const flattenedRows = hits.map(hit => {
    const flattened = {};

    // Flatten fields at top level (without "fields." prefix)
    if (hit.fields) {
      const flattenedFields = flattenObject(hit.fields);
      Object.assign(flattened, flattenedFields);
    }

    // Flatten other root properties with "root." prefix
    Object.entries(hit).forEach(([key, value]) => {
      if (key !== 'fields') {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          const nested = flattenObject(value, `root.${key}`);
          Object.assign(flattened, nested);
        } else {
          flattened[`root.${key}`] = value;
        }
      }
    });

    Object.keys(flattened).forEach(key => allColumns.add(key));
    return flattened;
  });

  // Sort columns: field columns first (alphabetically), then root columns (alphabetically)
  const columns = Array.from(allColumns).sort((a, b) => {
    const aIsRoot = a.startsWith('root.');
    const bIsRoot = b.startsWith('root.');

    if (aIsRoot && !bIsRoot) return 1; // a goes after b
    if (!aIsRoot && bIsRoot) return -1; // a goes before b
    return a.localeCompare(b); // both same type, sort alphabetically
  });

  // Format cell value
  const formatValue = value => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (hits.length === 0) {
    return <div className="p-4 text-center text-muted-foreground text-sm">No results to display</div>;
  }

  return (
    <div className="overflow-auto h-full">
      <table className="text-xs border-collapse" style={{ tableLayout: 'auto' }}>
        <thead className="sticky top-0 z-10">
          <tr className="bg-background">
            {columns.map(col => (
              <th
                key={col}
                className="border-x border-b border-t-0 border-border px-2 py-1.5 text-left font-semibold whitespace-nowrap bg-muted"
                style={{ maxWidth: '300px' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flattenedRows.map((row, idx) => (
            <tr key={idx} className="hover:bg-muted/50">
              {columns.map(col => {
                const value = formatValue(row[col]);
                return (
                  <td key={col} className="border border-border p-0" style={{ maxWidth: '300px' }}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full text-left px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap hover:bg-accent/50 cursor-pointer block">
                          {value}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto max-w-[800px] max-h-96 overflow-auto">
                        <div className="space-y-2">
                          <div className="font-semibold text-sm border-b pb-2">{col}</div>
                          <pre className="text-xs whitespace-pre-wrap break-all font-mono">{value}</pre>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
