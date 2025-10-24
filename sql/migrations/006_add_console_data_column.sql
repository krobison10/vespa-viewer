ALTER TABLE consoles 
ADD COLUMN console_data JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_consoles_console_data ON consoles USING GIN (console_data);

