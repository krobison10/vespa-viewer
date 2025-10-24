-- Create data_sources table
CREATE TABLE IF NOT EXISTS data_sources (
  id SERIAL PRIMARY KEY,
  uid INTEGER NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  search_url VARCHAR(255),
  search_port VARCHAR(10),
  document_url VARCHAR(255),
  document_port VARCHAR(10),
  config_url VARCHAR(255),
  config_port VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on uid for faster lookups
CREATE INDEX IF NOT EXISTS idx_data_sources_uid ON data_sources(uid);

-- Add comment describing the table
COMMENT ON TABLE data_sources IS 'Stores user data source connection configurations';
