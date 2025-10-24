-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  uid INTEGER PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment describing the table
COMMENT ON TABLE credentials IS 'Stores password hashes and salts for user authentication';

