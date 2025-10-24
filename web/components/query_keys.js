export const QUERY_KEYS = {
  USER: ['user'],
  DATA_SOURCES: ['data-sources'],
  CONSOLES: ['consoles'],
  CONSOLE: id => ['consoles', id],
  CONSOLES_BY_DATA_SOURCE: dataSourceId => ['consoles', 'data-source', dataSourceId],
};
