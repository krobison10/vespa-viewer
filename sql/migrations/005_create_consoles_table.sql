-- Create consoles table
CREATE TABLE IF NOT EXISTS consoles (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on data_source_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_consoles_data_source_id ON consoles(data_source_id);

-- Create index on is_default for faster default console lookups
CREATE INDEX IF NOT EXISTS idx_consoles_is_default ON consoles(data_source_id, is_default);

-- Create a trigger to ensure only one default console per data source
CREATE OR REPLACE FUNCTION ensure_single_default_console()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE consoles 
    SET is_default = FALSE 
    WHERE data_source_id = NEW.data_source_id 
      AND id != NEW.id 
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_console
  BEFORE INSERT OR UPDATE ON consoles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_console();
